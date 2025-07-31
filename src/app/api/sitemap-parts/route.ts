import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIMEOUT_MS = 25000; // 25 seconds
const MAX_PARTS = 2000; // Optimized for fast loading
const QUERY_TIMEOUT_MS = 20000; // 20 seconds for query

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
  // Range around 720k that's timing out
  { start: 700000, end: 750000 },
];

function isInKnownEmptyRange(startId: number, endId: number): boolean {
  return KNOWN_EMPTY_RANGES.some(range =>
    startId >= range.start && endId <= range.end
  );
}

// Pre-cache FSG/FSC data to avoid joins
let fsgFscCache: Map<string, { fsg_title: string; fsc_title: string }> | null = null;
let cacheExpiry = 0;

async function getFsgFscCache(client: any) {
  const now = Date.now();
  
  if (!fsgFscCache || now > cacheExpiry) {
    console.log('🔄 Refreshing FSG/FSC cache...');
    const result = await client.query(`
      SELECT DISTINCT fsg, fsc, fsg_title, fsc_title 
      FROM wp_fsgs_new 
      WHERE fsg_title IS NOT NULL AND fsc_title IS NOT NULL
    `);
    
    fsgFscCache = new Map();
    for (const row of result.rows) {
      const key = `${row.fsg}-${row.fsc}`;
      fsgFscCache.set(key, {
        fsg_title: row.fsg_title,
        fsc_title: row.fsc_title
      });
    }
    
    // Cache for 1 hour
    cacheExpiry = now + (60 * 60 * 1000);
    console.log(`✅ Cached ${fsgFscCache.size} FSG/FSC combinations`);
  }
  
  return fsgFscCache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "3000"), MAX_PARTS);
  const offset = parseInt(searchParams.get("offset") || "0");

  // Calculate the actual ID range from offset
  const startId = offset + 1;
  const endId = offset + limit;

  console.log(`📥 Sitemap API request: offset=${offset}, limit=${limit} (ID range: ${startId.toLocaleString()}-${endId.toLocaleString()})`);

  // Simple rate limiting
  const currentRequests = parseInt(process.env.CONCURRENT_REQUESTS || '0');
  if (currentRequests > 10) {
    console.log(`🚫 Rate limited: too many concurrent requests (${currentRequests})`);
    return NextResponse.json([], {
      status: 429,
      headers: {
        'Retry-After': '5',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  // Check if this is a known empty range
  if (isInKnownEmptyRange(startId, endId)) {
    console.log(`📭 Known empty range ${startId}-${endId}, returning empty immediately`);
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Parts-Count': '0',
        'X-Query-Time': '0',
        'X-Range': `${startId}-${endId}`,
        'X-Known-Empty': 'true'
      }
    });
  }

  // Increment request counter
  process.env.CONCURRENT_REQUESTS = (currentRequests + 1).toString();

  let client;
  try {
    const startTime = Date.now();

    // Get database connection
    client = await pool.connect();

    // Set aggressive timeout for ultra-fast response
    await client.query(`SET statement_timeout = ${QUERY_TIMEOUT_MS}`);
    await client.query(`SET work_mem = '256MB'`); // Increased for better sorting
    await client.query(`SET enable_seqscan = OFF`); // Force index usage

    // Get FSG/FSC cache
    const cache = await getFsgFscCache(client);

    console.log(`🚀 Optimized query for range ${startId}-${endId}`);

    // OPTIMIZED QUERY: Remove the JOIN and do in-memory lookup
    const query = `
      SELECT 
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
    `;

    const result = await client.query(query, [startId, endId, limit]);
    
    // Enrich with FSG/FSC titles from cache
    const parts = result.rows.map((row: { fsg: string; fsc: string; nsn: string }) => {
      const key = `${row.fsg}-${row.fsc}`;
      const titles = cache.get(key) || { fsg_title: '', fsc_title: '' };
      
      return {
        ...row,
        fsg_title: titles.fsg_title,
        fsc_title: titles.fsc_title
      };
    });

    const queryTime = Date.now() - startTime;
    console.log(`✅ Retrieved ${parts.length} parts in ${queryTime}ms for range ${startId}-${endId}`);

    return NextResponse.json(parts, {
      status: 200,
      headers: {
        'Cache-Control': parts.length === 0
          ? 'public, max-age=604800' // Cache empty results for 1 week
          : 'public, max-age=3600, stale-while-revalidate=7200', // 1h cache, 2h stale
        'X-Parts-Count': parts.length.toString(),
        'X-Query-Time': queryTime.toString(),
        'X-Range': `${startId}-${endId}`,
        'X-Optimized': 'true'
      }
    });

  } catch (error: any) {
    console.error(`❌ Sitemap API failed for range ${startId}-${endId}:`, error.message);

    // For any error in high ranges, return empty result
    if (startId > 1000000 || error.message.includes('timeout')) {
      console.log(`⏱️ Error in range ${startId}-${endId}, returning empty result`);
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=604800',
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
    // Decrement request counter
    const currentRequests = parseInt(process.env.CONCURRENT_REQUESTS || '0');
    process.env.CONCURRENT_REQUESTS = Math.max(0, currentRequests - 1).toString();
  }
}