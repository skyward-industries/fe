// File: src/app/api/sitemap-parts/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIMEOUT_MS = 25000; // 25 seconds (less than your 30s sitemap timeout)
const MAX_PARTS = 3000;

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

  try {
    const startTime = Date.now();

    // First, quick check if this range has any valid data
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM part_info pi
      LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
      WHERE pi.id BETWEEN $1 AND $2 
      AND pi.nsn IS NOT NULL 
      AND pi.nsn != ''
      AND fsgs.fsg_title IS NOT NULL 
      AND fsgs.fsc_title IS NOT NULL
    `;

    const countResult = await pool.query(countQuery, [startId, endId]);
    const partCount = parseInt(countResult.rows[0].count);

    if (partCount === 0) {
      console.log(`❌ No valid parts found in range ${startId}-${endId}`);
      clearTimeout(timeoutId);
      return NextResponse.json([], { status: 200 }); // Return empty array instead of 404
    }

    console.log(`📊 Found ${partCount} valid parts in range ${startId}-${endId}`);

    // Optimized query - only get what we need for sitemaps
    const query = `
      SELECT DISTINCT
        pi.fsg,
        pi.fsc,
        fsgs.fsg_title,
        fsgs.fsc_title,
        pi.nsn
      FROM part_info pi
      LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
      WHERE pi.id BETWEEN $1 AND $2 
      AND pi.nsn IS NOT NULL 
      AND pi.nsn != ''
      AND fsgs.fsg_title IS NOT NULL 
      AND fsgs.fsc_title IS NOT NULL
      ORDER BY pi.fsg, pi.fsc, pi.nsn
      LIMIT $3
    `;

    const result = await pool.query(query, [startId, endId, limit]);
    const parts = result.rows;

    const queryTime = Date.now() - startTime;
    console.log(`✅ Retrieved ${parts.length} parts in ${queryTime}ms for range ${startId}-${endId}`);

    clearTimeout(timeoutId);

    return NextResponse.json(parts, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=7200', // 2 hours
        'X-Parts-Count': parts.length.toString(),
        'X-Query-Time': queryTime.toString(),
        'X-Range': `${startId}-${endId}`
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`❌ Sitemap API failed for range ${startId}-${endId}:`, error.message);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout", range: `${startId}-${endId}` },
        { status: 408 }
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
  }
}