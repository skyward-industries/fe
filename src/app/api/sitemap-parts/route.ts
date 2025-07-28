// File: src/app/api/sitemap-parts/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIMEOUT_MS = 25000; // 25 seconds
const MAX_PARTS = 3000;
const QUERY_TIMEOUT_MS = 20000; // 20 seconds for query

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

    // Optimized single query that combines count and data retrieval
    // Uses EXISTS subquery for better performance with high IDs
    const query = `
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
        'Cache-Control': 'public, max-age=7200, stale-while-revalidate=3600', // 2 hours + stale-while-revalidate
        'X-Parts-Count': parts.length.toString(),
        'X-Query-Time': queryTime.toString(),
        'X-Range': `${startId}-${endId}`
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`❌ Sitemap API failed for range ${startId}-${endId}:`, error.message);
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { error: "Request timeout", range: `${startId}-${endId}` },
        { status: 408 }
      );
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