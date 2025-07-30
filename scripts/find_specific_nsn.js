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

async function findTargetNSN() {
  try {
    const client = await pool.connect();
    
    console.log('Looking for NSNs that should be 2990-00-000-0001...\n');
    
    // Check what we have for 2990-00-000- with single digit endings
    const query = `
      SELECT nsn
      FROM nsn_with_inc 
      WHERE nsn LIKE '2990-00-000-%'
        AND SUBSTRING(nsn FROM 14) ~ '^0000[0-9]$'
      ORDER BY nsn;
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      console.log('Found NSNs with 5-digit last segments (00001, 00002, etc.):');
      result.rows.forEach(row => {
        const lastSegment = row.nsn.substring(13);
        const shouldBe = '2990-00-000-' + lastSegment.replace(/^000+/, '').padStart(4, '0');
        console.log(`  ${row.nsn} → should be: ${shouldBe}`);
      });
    } else {
      console.log('No NSNs found with 00001-00009 pattern.');
    }
    
    // Also check what the original 010001 became
    console.log('\nChecking what happened to the original 010001:');
    const originalQuery = `
      SELECT nsn
      FROM nsn_with_inc 
      WHERE nsn = '2990-00-000-00001';
    `;
    
    const originalResult = await client.query(originalQuery);
    if (originalResult.rows.length > 0) {
      console.log('✅ Found: 2990-00-000-00001 (this was probably 2990-00-000-010001)');
      console.log('   This should be corrected to: 2990-00-000-0001');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findTargetNSN();