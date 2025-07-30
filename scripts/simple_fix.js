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

async function fixSpecificNSN() {
  try {
    const client = await pool.connect();
    
    console.log('🔧 Directly fixing 2990-00-000-00001 → 2990-00-000-0001\n');
    
    // Simple direct update
    const updateQuery = `
      UPDATE nsn_with_inc 
      SET nsn = '2990-00-000-0001'
      WHERE nsn = '2990-00-000-00001';
    `;
    
    const result = await client.query(updateQuery);
    console.log(`✅ Updated ${result.rowCount} record(s).`);
    
    // Verify the change
    const verifyQuery = `
      SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-0001';
    `;
    
    const verifyResult = await client.query(verifyQuery);
    if (verifyResult.rows.length > 0) {
      console.log('✅ SUCCESS: 2990-00-000-0001 now exists!');
    } else {
      console.log('❌ Verification failed: 2990-00-000-0001 not found');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixSpecificNSN();