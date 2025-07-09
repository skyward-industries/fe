// @ts-ignore
import pool from '@/lib/db.js';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM part_info LIMIT 10');
    return new Response(JSON.stringify({ time: result.rows[0] }), {
      status: 200,
    });
  } catch (err) {
    console.error('❌ DB Error:', err);
    return new Response(JSON.stringify({ error: 'DB connection failed' }), {
      status: 500,
    });
  }
}