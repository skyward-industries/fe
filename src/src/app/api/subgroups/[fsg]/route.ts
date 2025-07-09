import { pool } from "/home/ec2-user/fe/src/lib/db"

export async function GET(req: Request, context: { params: { fsg: string } }) {
  const { fsg } = context.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        fsg,
        fsc,
        fsg_title,
        fsg_notes,
        fsc_title,
        fsc_notes,
        fsc_inclusions,
        fsc_exclusions
      FROM wp_fsgs
      WHERE fsg = $1
      ORDER BY fsc
      `,
      [fsg]
    );

    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('❌ Error in /api/subgroups/[fsg]:', err);
    return new Response(JSON.stringify({ error: 'Subgroup query failed' }), {
      status: 500,
    });
  }
}

