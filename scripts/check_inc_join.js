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

async function checkINCJoin() {
  try {
    const client = await pool.connect();
    
    // Check data types and sample values
    console.log('🔍 Checking INC data types and values...\n');
    
    // Check nsn_with_inc
    const nwiQuery = `
      SELECT 
        inc,
        pg_typeof(inc) as inc_type,
        COUNT(*) as count
      FROM nsn_with_inc 
      WHERE inc IS NOT NULL
      GROUP BY inc, pg_typeof(inc)
      ORDER BY count DESC
      LIMIT 5;
    `;
    
    const nwiResult = await client.query(nwiQuery);
    console.log('nsn_with_inc INC values:');
    nwiResult.rows.forEach(row => {
      console.log(`  INC: ${row.inc} (type: ${row.inc_type}, count: ${row.count})`);
    });
    
    // Check v_h6_name_inc
    console.log('\nv_h6_name_inc INC values:');
    const h6Query = `
      SELECT 
        inc,
        pg_typeof(inc) as inc_type,
        inc_status,
        SUBSTRING(definition FROM 1 FOR 50) as def_preview
      FROM v_h6_name_inc
      WHERE inc IS NOT NULL
      LIMIT 5;
    `;
    
    const h6Result = await client.query(h6Query);
    h6Result.rows.forEach(row => {
      console.log(`  INC: ${row.inc} (type: ${row.inc_type}, status: ${row.inc_status})`);
    });
    
    // Try to find matching INC values
    console.log('\n🔍 Looking for matching INC values between tables...\n');
    
    const matchQuery = `
      SELECT 
        nwi.inc as nwi_inc,
        h6.inc as h6_inc,
        COUNT(DISTINCT nwi.nsn) as nsn_count
      FROM nsn_with_inc nwi
      INNER JOIN v_h6_name_inc h6 ON nwi.inc::text = h6.inc::text
      WHERE nwi.inc IS NOT NULL
      GROUP BY nwi.inc, h6.inc
      LIMIT 10;
    `;
    
    const matchResult = await client.query(matchQuery);
    
    if (matchResult.rows.length > 0) {
      console.log('Found matching INC values:');
      matchResult.rows.forEach(row => {
        console.log(`  INC ${row.nwi_inc} matches ${row.h6_inc} (${row.nsn_count} NSNs)`);
      });
    } else {
      console.log('No matching INC values found between tables');
    }
    
    // Check if numeric INC values need padding
    console.log('\n🔍 Checking if INC values need padding...\n');
    
    const paddingQuery = `
      SELECT DISTINCT
        nwi.inc as numeric_inc,
        LPAD(nwi.inc::text, 5, '0') as padded_inc,
        EXISTS(SELECT 1 FROM v_h6_name_inc h6 WHERE h6.inc = LPAD(nwi.inc::text, 5, '0')) as padded_exists
      FROM nsn_with_inc nwi
      WHERE nwi.inc IS NOT NULL
        AND nwi.inc::text ~ '^[0-9]+$'
      ORDER BY nwi.inc
      LIMIT 10;
    `;
    
    const paddingResult = await client.query(paddingQuery);
    
    console.log('INC padding check:');
    paddingResult.rows.forEach(row => {
      console.log(`  INC ${row.numeric_inc} → ${row.padded_inc} (exists in h6: ${row.padded_exists})`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkINCJoin();