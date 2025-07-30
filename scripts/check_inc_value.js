#!/usr/bin/env node

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Database connection
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

async function checkIncValue() {
  try {
    const client = await pool.connect();
    
    console.log("🔍 Checking INC value for NSN 2990-00-000-0001\n");
    
    const query = `
      SELECT nsn, inc, item_name 
      FROM nsn_with_inc 
      WHERE nsn = '2990-00-000-0001';
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('NSN:', row.nsn);
      console.log('INC:', row.inc || 'NULL');
      console.log('Item Name:', row.item_name || 'NULL');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkIncValue();