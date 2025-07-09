// src/app/api/test/route.ts (or whatever the file is named)

// FIXED: Clean path and import 'pool' directly because it's a default export from db.js
import { pool } from "/home/ec2-user/fe/src/lib/db"

export async function GET() {
  try {
    // FIXED: Now the 'pool' variable exists and can be used
    const result = await pool.query('SELECT * FROM part_info LIMIT 10');

    // Your logic here is good!
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