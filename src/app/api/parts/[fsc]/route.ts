// @ts-ignore
import pool from '@/lib/db';

export async function GET(req: Request, context: { params: { fsc: string } }) {
  const { fsc } = context.params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = (page - 1) * limit;

  try {
    const dataQuery = `
      SELECT id, nsn, fsg, fsc
      FROM part_info
      WHERE fsc = $1
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    const dataResult = await pool.query(dataQuery, [fsc, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) FROM part_info WHERE fsc = $1
    `;
    const countResult = await pool.query(countQuery, [fsc]);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const response = {
      data: dataResult.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('❌ Error in /api/parts/[fsc]:', err);
    return new Response(JSON.stringify({ error: 'Parts query failed' }), {
      status: 500,
    });
  }
}
