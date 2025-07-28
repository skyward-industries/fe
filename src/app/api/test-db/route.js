import { pool } from "../../../lib/db.js";

export async function GET() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM part_info LIMIT 1');
    return Response.json({ 
      success: true, 
      count: result.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
