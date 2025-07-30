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

async function checkSpecificNSN() {
  try {
    const client = await pool.connect();
    
    // Check if the specific NSN from your screenshot exists
    console.log('Checking for NSN: 2990-00-000-0001');
    const query1 = `
      SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-0001';
    `;
    
    const result1 = await client.query(query1);
    if (result1.rows.length > 0) {
      console.log('✅ Found: 2990-00-000-0001');
    } else {
      console.log('❌ Not found: 2990-00-000-0001');
    }
    
    // Check if the old format still exists
    console.log('\nChecking for old format: 2990-00-000-010001');
    const query2 = `
      SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-010001';
    `;
    
    const result2 = await client.query(query2);
    if (result2.rows.length > 0) {
      console.log('⚠️  Still exists: 2990-00-000-010001 (update may not have worked)');
    } else {
      console.log('✅ Old format gone: 2990-00-000-010001');
    }
    
    // Check for any NSNs starting with 2990-00-000-
    console.log('\nAll NSNs starting with 2990-00-000-:');
    const query3 = `
      SELECT nsn FROM nsn_with_inc WHERE nsn LIKE '2990-00-000-%' ORDER BY nsn;
    `;
    
    const result3 = await client.query(query3);
    result3.rows.forEach(row => {
      console.log(`  ${row.nsn}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSpecificNSN();