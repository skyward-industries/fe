import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { nsn: string } }
) {
  const { nsn } = params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    // Get related parts: same FSC, similar NSN patterns, cross-references
    const query = `
      WITH current_part AS (
        SELECT fsg, fsc FROM part_info WHERE nsn = $1 LIMIT 1
      ),
      related_by_fsc AS (
        SELECT DISTINCT p.nsn, p.fsg, p.fsc, p.item_name, f1.title as fsg_title, f2.title as fsc_title
        FROM part_info p
        CROSS JOIN current_part cp
        LEFT JOIN wp_fsgs f1 ON p.fsg = f1.fsg
        LEFT JOIN wp_fsgs f2 ON p.fsc::text = f2.fsg
        WHERE p.fsc = cp.fsc 
          AND p.nsn != $1
          AND p.nsn IS NOT NULL
        ORDER BY RANDOM()
        LIMIT $2
      ),
      related_by_prefix AS (
        SELECT DISTINCT p.nsn, p.fsg, p.fsc, p.item_name, f1.title as fsg_title, f2.title as fsc_title
        FROM part_info p
        LEFT JOIN wp_fsgs f1 ON p.fsg = f1.fsg
        LEFT JOIN wp_fsgs f2 ON p.fsc::text = f2.fsg
        WHERE LEFT(p.nsn, 4) = LEFT($1, 4)
          AND p.nsn != $1
          AND p.nsn IS NOT NULL
        ORDER BY RANDOM()
        LIMIT $2
      )
      SELECT * FROM related_by_fsc
      UNION ALL
      SELECT * FROM related_by_prefix
      LIMIT $2
    `;

    const result = await pool.query(query, [nsn, limit]);
    
    return Response.json(result.rows);

  } catch (error) {
    console.error('Error fetching related parts:', error);
    return Response.json({ error: 'Failed to fetch related parts' }, { status: 500 });
  }
}