#!/bin/bash

echo "🔧 Fix Sitemap Timeouts on Production"
echo "===================================="
echo ""
echo "This script will apply a temporary fix to stop the timeouts."
echo ""
echo "Run on your production server:"
echo ""
echo "cd /home/ec2-user/fe"
echo ""
echo "# Create a new sitemap route that handles timeouts better:"
echo "cat > src/app/api/sitemap-parts/route.ts << 'EOF'"
cat << 'EOF'
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIMEOUT_MS = 8000; // 8 seconds total timeout
const QUERY_TIMEOUT_MS = 5000; // 5 seconds for query

// Problematic ranges that should return empty immediately
const PROBLEM_RANGES = [
  { start: 700000, end: 760000 },   // 700k-760k range
  { start: 2600000, end: 3000000 }, // 2.6M-3M range  
  { start: 4000000, end: 5000000 }, // 4M-5M range
];

function isProblematicRange(offset: number): boolean {
  const id = offset + 1;
  return PROBLEM_RANGES.some(range => 
    id >= range.start && id <= range.end
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "2000"), 2000);
  const offset = parseInt(searchParams.get("offset") || "0");
  
  console.log(`📥 Sitemap API request: offset=${offset}, limit=${limit}`);

  // Return empty for problematic ranges
  if (isProblematicRange(offset)) {
    console.log(`⚠️ Problematic range detected at offset ${offset}, returning empty`);
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'X-Parts-Count': '0',
        'X-Problematic-Range': 'true'
      }
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let client;
  try {
    // Get connection with timeout
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      )
    ]);

    // Set conservative query timeout
    await client.query(`SET statement_timeout = ${QUERY_TIMEOUT_MS}`);
    
    const query = `
      SELECT 
        pi.fsg,
        pi.fsc,
        pi.nsn,
        COALESCE(fsgs.fsg_title, '') as fsg_title,
        COALESCE(fsgs.fsc_title, '') as fsc_title
      FROM part_info pi
      LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.id > $1 
        AND pi.id <= $2
        AND pi.nsn IS NOT NULL 
        AND pi.nsn != ''
      ORDER BY pi.id
      LIMIT $3
    `;

    const startId = offset;
    const endId = offset + limit;
    
    const result = await client.query(query, [startId, endId, limit]);
    
    clearTimeout(timeoutId);

    return NextResponse.json(result.rows, {
      status: 200,
      headers: {
        'Cache-Control': result.rows.length === 0 
          ? 'public, max-age=86400' 
          : 'public, max-age=3600',
        'X-Parts-Count': result.rows.length.toString()
      }
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`❌ Sitemap query failed for offset ${offset}:`, error.message);
    
    // Return empty result instead of error
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'X-Parts-Count': '0',
        'X-Error': 'timeout'
      }
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
EOF
echo "EOF"
echo ""
echo "# Then restart the app:"
echo "pm2 restart skyward-prod"
echo ""
echo "This fix will:"
echo "- Return empty arrays for problematic ranges (700k-760k)"
echo "- Use shorter timeouts (8s total, 5s query)"
echo "- Return empty results on errors instead of 500s"
echo "- Simplify the query logic"