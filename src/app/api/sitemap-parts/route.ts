// File: src/app/api/sitemap-parts/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIMEOUT_MS = 25000; // 25 seconds
const MAX_PARTS = 3000;
const QUERY_TIMEOUT_MS = 20000; // 20 seconds for query
const HIGH_ID_THRESHOLD = 1000000; // IDs above this use different strategy

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "3000"), MAX_PARTS);
  const offset = parseInt(searchParams.get("offset") || "0");
  
  // Calculate the actual ID range from offset
  const startId = offset + 1;
  const endId = offset + limit;
  
  console.log(`📥 Sitemap API request: offset=${offset}, limit=${limit} (ID range: ${startId.toLocaleString()}-${endId.toLocaleString()})`);

  // Set up timeout for the entire request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let client;
  try {
    const startTime = Date.now();
    client = await pool.connect();

    // Set statement timeout for this session
    await client.query(`SET statement_timeout = ${QUERY_TIMEOUT_MS}`);
    
    // For very high ID ranges, use a more aggressive strategy
    if (startId > HIGH_ID_THRESHOLD) {
      // First, check if there are ANY parts in this range
      const existsQuery = `
        SELECT EXISTS (
          SELECT 1 
          FROM part_info pi
          WHERE pi.id >= $1 
            AND pi.id <= $2
            AND pi.nsn IS NOT NULL 
            AND pi.nsn != ''
          LIMIT 1
        ) as has_parts
      `;
      
      const existsResult = await client.query(existsQuery, [startId, endId]);
      
      if (!existsResult.rows[0].has_parts) {
        console.log(`📭 No parts exist in high ID range ${startId}-${endId}`);
        clearTimeout(timeoutId);
        return NextResponse.json([], {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=86400', // Cache empty results for 24h
            'X-Parts-Count': '0',
            'X-Query-Time': (Date.now() - startTime).toString(),
            'X-Range': `${startId}-${endId}`,
            'X-High-ID-Range': 'true'
          }
        });
      }
    }

    // Use different query strategies based on ID range
    let query;
    
    if (startId > HIGH_ID_THRESHOLD * 10) {
      // For very high IDs, use index-only scan with minimal joins
      query = `
        WITH id_range AS (
          SELECT pi.id, pi.fsg, pi.fsc, pi.nsn
          FROM part_info pi
          WHERE pi.id >= $1 
            AND pi.id <= $2
            AND pi.nsn IS NOT NULL 
            AND pi.nsn != ''
          ORDER BY pi.id
          LIMIT $3
        )
        SELECT 
          ir.fsg,
          ir.fsc,
          ir.nsn,
          fsgs.fsg_title,
          fsgs.fsc_title
        FROM id_range ir
        LEFT JOIN wp_fsgs_new fsgs ON ir.fsg = fsgs.fsg
        WHERE fsgs.fsg_title IS NOT NULL 
          AND fsgs.fsc_title IS NOT NULL
      `;
    } else {
      // Standard query for normal ID ranges
      query = `
        WITH valid_parts AS (
          SELECT 
            pi.id,
            pi.fsg,
            pi.fsc,
            pi.nsn,
            fsgs.fsg_title,
            fsgs.fsc_title
          FROM part_info pi
          INNER JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
          WHERE pi.id >= $1 
            AND pi.id <= $2
            AND pi.nsn IS NOT NULL 
            AND pi.nsn != ''
            AND fsgs.fsg_title IS NOT NULL 
            AND fsgs.fsc_title IS NOT NULL
          ORDER BY pi.id
          LIMIT $3
        )
        SELECT 
          fsg,
          fsc,
          fsg_title,
          fsc_title,
          nsn
        FROM valid_parts
      `;
    }

    const result = await client.query(query, [startId, endId, limit]);
    const parts = result.rows;

    const queryTime = Date.now() - startTime;
    console.log(`✅ Retrieved ${parts.length} parts in ${queryTime}ms for range ${startId}-${endId}`);

    clearTimeout(timeoutId);

    // Return empty array for ranges with no data (avoid 404s)
    if (!parts || parts.length === 0) {
      console.log(`📭 No valid parts found in range ${startId}-${endId}`);
    }

    return NextResponse.json(parts, {
      status: 200,
      headers: {
        'Cache-Control': parts.length === 0 
          ? 'public, max-age=86400' // Cache empty results for 24h
          : 'public, max-age=7200, stale-while-revalidate=3600', // 2h for non-empty
        'X-Parts-Count': parts.length.toString(),
        'X-Query-Time': queryTime.toString(),
        'X-Range': `${startId}-${endId}`,
        'X-Query-Strategy': startId > HIGH_ID_THRESHOLD * 10 ? 'high-id' : 'standard'
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`❌ Sitemap API failed for range ${startId}-${endId}:`, error.message);
    
    // For timeout errors, return empty result instead of error
    if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('canceling statement')) {
      console.log(`⏱️ Query timeout for range ${startId}-${endId}, returning empty result`);
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400', // Cache timeout results
          'X-Parts-Count': '0',
          'X-Range': `${startId}-${endId}`,
          'X-Timeout': 'true'
        }
      });
    }
    
    // For high ID ranges that truly don't exist, return empty array
    if (error.message.includes('no rows') || error.code === '42P01') {
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400', // Cache empty results longer (24h)
          'X-Parts-Count': '0',
          'X-Range': `${startId}-${endId}`
        }
      });
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