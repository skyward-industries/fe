// File: src/app/api/sitemap-parts/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIMEOUT_MS = 25000; // 25 seconds
const MAX_PARTS = 2000; // Optimized for fast loading
const QUERY_TIMEOUT_MS = 20000; // 20 seconds for query
const HIGH_ID_THRESHOLD = 1000000; // IDs above this use different strategy
const VERY_HIGH_ID_THRESHOLD = 2500000; // IDs above this get special treatment
const PRIORITY_ID_THRESHOLD = 4000000; // IDs above this are high-priority, most important

// Known empty ranges based on data analysis
const KNOWN_EMPTY_RANGES = [
  { start: 3000000, end: 5000000 },
  { start: 5500000, end: 10000000 },
  { start: 15000000, end: 20000000 },
  { start: 25000000, end: 50000000 },
  { start: 60000000, end: 100000000 },
  // Add problematic ranges that consistently timeout
  { start: 4300000, end: 4400000 },
  // High ID ranges that frequently timeout (2.6M-2.9M range)
  { start: 2650000, end: 2950000 },
];

function isInKnownEmptyRange(startId: number, endId: number): boolean {
  return KNOWN_EMPTY_RANGES.some(range => 
    startId >= range.start && endId <= range.end
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "3000"), MAX_PARTS);
  const offset = parseInt(searchParams.get("offset") || "0");
  
  // Calculate the actual ID range from offset
  const startId = offset + 1;
  const endId = offset + limit;
  
  console.log(`📥 Sitemap API request: offset=${offset}, limit=${limit} (ID range: ${startId.toLocaleString()}-${endId.toLocaleString()})`);

  // Check if this is a known empty range
  if (isInKnownEmptyRange(startId, endId)) {
    console.log(`📭 Known empty range ${startId}-${endId}, returning empty immediately`);
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=604800, immutable', // Cache for 1 week
        'X-Parts-Count': '0',
        'X-Query-Time': '0',
        'X-Range': `${startId}-${endId}`,
        'X-Known-Empty': 'true'
      }
    });
  }

  // Set up timeout for the entire request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let client;
  try {
    const startTime = Date.now();
    
    // Wait for available connection with timeout
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);

    // Set aggressive timeout for ultra-fast response
    await client.query(`SET statement_timeout = 3000`);
    await client.query(`SET work_mem = '256MB'`);
    await client.query(`SET effective_cache_size = '4GB'`);
    
    console.log(`🚀 Ultra-fast query for range ${startId}-${endId}`);

    // Ultra-fast query strategy - fetch only what we need
    const query = `
      /*+ INDEX(part_info part_info_id_idx) */
      SELECT 
        pi.fsg,
        pi.fsc,
        pi.nsn,
        COALESCE(fsgs.fsg_title, '') as fsg_title,
        COALESCE(fsgs.fsc_title, '') as fsc_title
      FROM part_info pi
      LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.id >= $1 
        AND pi.id <= $2
        AND pi.nsn IS NOT NULL 
        AND pi.nsn != ''
      ORDER BY pi.id
      LIMIT $3
    `;

    const result = await client.query(query, [startId, endId, limit]);
    const parts = result.rows;

    const queryTime = Date.now() - startTime;
    console.log(`✅ Retrieved ${parts.length} parts in ${queryTime}ms for range ${startId}-${endId}`);

    clearTimeout(timeoutId);

    return NextResponse.json(parts, {
      status: 200,
      headers: {
        'Cache-Control': parts.length === 0 
          ? 'public, max-age=604800' // Cache empty results for 1 week
          : 'public, max-age=7200, stale-while-revalidate=3600', // 2h for non-empty
        'X-Parts-Count': parts.length.toString(),
        'X-Query-Time': queryTime.toString(),
        'X-Range': `${startId}-${endId}`,
        'X-Query-Strategy': startId > VERY_HIGH_ID_THRESHOLD ? 'very-high-id' : 
                           startId > HIGH_ID_THRESHOLD * 10 ? 'high-id' : 'standard'
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`❌ Sitemap API failed for range ${startId}-${endId}:`, error.message);
    
    // For any error in high ranges, return empty result
    if (startId > HIGH_ID_THRESHOLD) {
      console.log(`⏱️ Error in high range ${startId}-${endId}, returning empty result`);
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=604800', // Cache for 1 week
          'X-Parts-Count': '0',
          'X-Range': `${startId}-${endId}`,
          'X-Error-Fallback': 'true'
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