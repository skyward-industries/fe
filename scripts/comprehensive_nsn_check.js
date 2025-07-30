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

async function comprehensiveCheck() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Comprehensive NSN Analysis\n');
    
    // 1. Check NSN length distribution
    console.log('1. NSN Length Distribution:');
    const lengthQuery = `
      SELECT LENGTH(nsn) as nsn_length, COUNT(*) as count
      FROM nsn_with_inc 
      WHERE nsn IS NOT NULL
      GROUP BY LENGTH(nsn)
      ORDER BY nsn_length;
    `;
    
    const lengthResult = await client.query(lengthQuery);
    lengthResult.rows.forEach(row => {
      console.log(`   Length ${row.nsn_length}: ${row.count} records`);
    });
    
    // 2. Check for NSNs longer than 18 chars (these would have extra zeros)
    console.log('\n2. NSNs longer than 18 characters:');
    const longQuery = `
      SELECT nsn, LENGTH(nsn) as length
      FROM nsn_with_inc 
      WHERE LENGTH(nsn) > 18
      LIMIT 10;
    `;
    
    const longResult = await client.query(longQuery);
    if (longResult.rows.length > 0) {
      longResult.rows.forEach(row => {
        console.log(`   ${row.nsn} (length: ${row.length})`);
      });
    } else {
      console.log('   No NSNs found longer than 18 characters');
    }
    
    // 3. Check specific patterns that might need correction
    console.log('\n3. Checking for last segments with extra leading zeros:');
    const patternQuery = `
      SELECT nsn,
             SUBSTRING(nsn FROM 15) as last_segment,
             CASE 
               WHEN LENGTH(nsn) > 18 THEN 'Too long'
               WHEN SUBSTRING(nsn FROM 15) ~ '^000[0-9]+$' THEN 'Has 3+ leading zeros'
               WHEN SUBSTRING(nsn FROM 15) ~ '^00[0-9]+$' AND LENGTH(SUBSTRING(nsn FROM 15)) > 4 THEN 'Has extra leading zeros'
               ELSE 'OK'
             END as status
      FROM nsn_with_inc 
      WHERE nsn IS NOT NULL
        AND (LENGTH(nsn) > 18 
             OR (SUBSTRING(nsn FROM 15) ~ '^00[0-9]+$' AND LENGTH(SUBSTRING(nsn FROM 15)) > 4)
             OR SUBSTRING(nsn FROM 15) ~ '^000[0-9]+$')
      LIMIT 10;
    `;
    
    const patternResult = await client.query(patternQuery);
    if (patternResult.rows.length > 0) {
      console.log('   NSN\t\t\t\tLast Segment\tStatus');
      console.log('   ' + '─'.repeat(70));
      patternResult.rows.forEach(row => {
        console.log(`   ${row.nsn}\t${row.last_segment}\t\t${row.status}`);
      });
    } else {
      console.log('   No NSNs found with problematic patterns');
    }
    
    // 4. Check if the example NSN exists and what format it's in
    console.log('\n4. Checking specific example NSN:');
    const exampleQuery = `
      SELECT nsn, LENGTH(nsn) as length, SUBSTRING(nsn FROM 15) as last_segment
      FROM nsn_with_inc 
      WHERE nsn LIKE '8940-00-000-%'
      LIMIT 5;
    `;
    
    const exampleResult = await client.query(exampleQuery);
    if (exampleResult.rows.length > 0) {
      console.log('   NSNs starting with 8940-00-000-:');
      exampleResult.rows.forEach(row => {
        console.log(`   ${row.nsn} (last segment: ${row.last_segment})`);
      });
    } else {
      console.log('   No NSNs found starting with 8940-00-000-');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

comprehensiveCheck();