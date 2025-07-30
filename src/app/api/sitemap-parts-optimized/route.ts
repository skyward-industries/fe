// Optimized sitemap API for partitioned database
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const maxDuration = 60; // 60 seconds for high ID ranges

const TIMEOUT_MS = 50000; // 50 seconds - handle cold starts
const MAX_PARTS = 2500; // Smaller batches for reliability
const QUERY_TIMEOUT_MS = 30000; // 30 seconds for query
const HIGH_ID_THRESHOLD = 1000000;
const PARTITION_RANGES = [
  { partition: 'part_info_p1', start: 1, end: 500000 },
  { partition: 'part_info_p2', start: 500001, end: 1000000 },
  { partition: 'part_info_p3', start: 1000001, end: 2000000 },
  { partition: 'part_info_p4', start: 2000001, end: 3000000 },
  { partition: 'part_info_p5', start: 3000001, end: 4000000 },
  { partition: 'part_info_p6', start: 4000001, end: 5000000 },
  { partition: 'part_info_p7', start: 5000001, end: 10000000 },
  { partition: 'part_info_p8', start: 10000001, end: 100000000 }
];

// Get the specific partition for a given ID range
function getPartitionForRange(startId: number, endId: number): string | null {
  for (const range of PARTITION_RANGES) {
    if (startId >= range.start && endId <= range.end) {
      return range.partition;
    }
  }
  return null;
}

// Retry function with exponential backoff
async function retryQuery(
  queryFn: () => Promise<any>, 
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<any> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`⚠️ Query attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "3000"), MAX_PARTS);
  const offset = parseInt(searchParams.get("offset") || "0");
  const forceRetry = searchParams.get("retry") === "true";
  
  // Calculate the actual ID range from offset
  const startId = offset + 1;
  const endId = offset + limit;
  
  console.log(`📥 Optimized Sitemap API: offset=${offset}, limit=${limit} (ID range: ${startId.toLocaleString()}-${endId.toLocaleString()})`);

  // Set up timeout for the entire request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let client: any;
  try {
    const startTime = Date.now();
    
    // Determine which partition to query
    const partition = getPartitionForRange(startId, endId);
    const usePartition = partition && !forceRetry;
    
    console.log(`🎯 Target partition: ${partition || 'none (using full table)'}`);
    
    // Query function that we'll potentially retry
    const executeQuery = async () => {
      // Add warmup query for cold starts
      client = await pool.connect();
      
      try {
        // Quick warmup query to establish connection
        await client.query('SELECT 1');
      } catch (warmupError: any) {
        console.log('⚡ Connection warmup skipped:', warmupError.message);
      }
      
      // Set appropriate timeout based on ID range - handle cold starts
      const queryTimeout = startId >= 3000000 ? 25000 : 
                           startId > HIGH_ID_THRESHOLD ? 20000 : QUERY_TIMEOUT_MS;
      await client.query(`SET statement_timeout = ${queryTimeout}`);
      
      // For high ID ranges above 3M, skip existence check and use direct partition query
      // The check itself can be slow for very high ranges
      
      // Build optimized query based on partition availability
      let query;
      
      if (usePartition) {
        // For 3M+ ranges, use optimized partition query with index hints
        if (startId >= 3000000) {
          query = `
            /*+ PARALLEL(pi 4) INDEX(pi part_info_id_idx) */
            SELECT 
              pi.fsg,
              pi.fsc,
              pi.nsn,
              fsgs.fsg_title,
              fsgs.fsc_title
            FROM ${partition} pi
            INNER JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
            WHERE pi.id >= $1 
              AND pi.id <= $2
              AND pi.nsn IS NOT NULL 
              AND pi.nsn != ''
              AND fsgs.fsg_title IS NOT NULL 
              AND fsgs.fsc_title IS NOT NULL
            ORDER BY pi.id
            LIMIT $3
          `;
        } else {
          // Standard partition query for lower ranges
          query = `
            WITH partition_data AS (
              SELECT 
                pi.id,
                pi.fsg,
                pi.fsc,
                pi.nsn
              FROM ${partition} pi
              WHERE pi.id >= $1 
                AND pi.id <= $2
                AND pi.nsn IS NOT NULL 
                AND pi.nsn != ''
              ORDER BY pi.id
              LIMIT $3
            )
            SELECT 
              pd.fsg,
              pd.fsc,
              pd.nsn,
              fsgs.fsg_title,
              fsgs.fsc_title
            FROM partition_data pd
            LEFT JOIN wp_fsgs_new fsgs ON pd.fsg = fsgs.fsg
            WHERE fsgs.fsg_title IS NOT NULL 
              AND fsgs.fsc_title IS NOT NULL
          `;
        }
      } else {
        // Fallback to regular table query with index hints
        query = `
          WITH valid_ids AS (
            SELECT /*+ INDEX(part_info part_info_id_idx) */
              pi.id,
              pi.fsg,
              pi.fsc,
              pi.nsn
            FROM part_info pi
            WHERE pi.id >= $1 
              AND pi.id <= $2
              AND pi.nsn IS NOT NULL 
              AND pi.nsn != ''
            ORDER BY pi.id
            LIMIT $3
          )
          SELECT 
            vi.fsg,
            vi.fsc,
            vi.nsn,
            fsgs.fsg_title,
            fsgs.fsc_title
          FROM valid_ids vi
          LEFT JOIN wp_fsgs_new fsgs ON vi.fsg = fsgs.fsg
          WHERE fsgs.fsg_title IS NOT NULL 
            AND fsgs.fsc_title IS NOT NULL
        `;
      }
      
      return await client.query(query, [startId, endId, limit]);
    };
    
    // Execute query with retry logic for high ID ranges
    const result = startId > HIGH_ID_THRESHOLD && forceRetry
      ? await retryQuery(executeQuery, 3, 2000)
      : await executeQuery();
    
    const parts = result.rows;
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ Retrieved ${parts.length} parts in ${queryTime}ms for range ${startId}-${endId}`);

    clearTimeout(timeoutId);

    // Set appropriate cache headers
    const cacheControl = parts.length === 0 
      ? 'public, max-age=86400, stale-while-revalidate=604800' // 1 day for empty, stale for 1 week
      : 'public, max-age=3600, stale-while-revalidate=86400'; // 1h for non-empty, stale for 1 day

    return NextResponse.json(parts, {
      status: 200,
      headers: {
        'Cache-Control': cacheControl,
        'X-Parts-Count': parts.length.toString(),
        'X-Query-Time': queryTime.toString(),
        'X-Range': `${startId}-${endId}`,
        'X-Partition': partition || 'none',
        'X-Query-Strategy': usePartition ? 'partition' : 'full-table'
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`❌ Optimized Sitemap API failed for range ${startId}-${endId}:`, error.message);
    
    // For timeout errors on high ranges, suggest retry with force flag
    if (error.message.includes('timeout') && startId > HIGH_ID_THRESHOLD) {
      return NextResponse.json(
        { 
          error: "Query timeout - try with retry=true parameter", 
          range: `${startId}-${endId}`,
          suggestion: `${request.url}&retry=true`
        },
        { 
          status: 503,
          headers: {
            'Retry-After': '5',
            'X-Range': `${startId}-${endId}`
          }
        }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Database query failed", 
        range: `${startId}-${endId}`,
        detail: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}