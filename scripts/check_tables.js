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

async function checkTables() {
  try {
    const client = await pool.connect();
    
    // Check for tables that might contain NSN data
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name ILIKE '%inc%'
      ORDER BY table_name;
    `;
    
    const result = await client.query(query);
    console.log('Tables containing "inc":', result.rows.map(r => r.table_name));
    
    // Also check for any tables with NSN columns
    const nsnQuery = `
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name ILIKE '%nsn%'
      ORDER BY table_name, column_name;
    `;
    
    const nsnResult = await client.query(nsnQuery);
    console.log('\nTables with NSN columns:');
    nsnResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();