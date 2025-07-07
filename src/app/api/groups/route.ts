import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT 
        fsg AS id, 
        fsg, 
        fsc, 
        fsg_title, 
        fsg_notes, 
        fsc_title, 
        fsc_notes, 
        fsc_inclusions, 
        fsc_exclusions
      FROM wp_fsgs
      WHERE fsg IS NOT NULL AND fsc IS NOT NULL
      ORDER BY fsg, fsc
    `);

    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('❌ DB Error in /api/groups:', err);
    return new Response(JSON.stringify({ error: 'DB query failed' }), {
      status: 500,
    });
  }
}
