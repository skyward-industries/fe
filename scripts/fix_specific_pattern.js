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

async function previewCorrection() {
  console.log('🔍 Previewing NSNs with extra leading zeros in last segment...\n');
  
  const query = `
    SELECT nsn,
           SUBSTRING(nsn FROM 1 FOR 13) || 
           LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0') as corrected_nsn,
           SUBSTRING(nsn FROM 14) as current_last_segment,
           LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0') as corrected_last_segment
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 17
      AND LENGTH(SUBSTRING(nsn FROM 14)) = 4
      AND SUBSTRING(nsn FROM 14) ~ '^000[1-9]$'
    LIMIT 20;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length === 0) {
      console.log('✅ No NSNs found with 000X pattern that need correction.');
      
      // Check what we actually have for the specific case
      const specificQuery = `
        SELECT nsn, SUBSTRING(nsn FROM 14) as last_segment
        FROM nsn_with_inc 
        WHERE nsn = '2990-00-000-00001';
      `;
      
      const specificResult = await client.query(specificQuery);
      if (specificResult.rows.length > 0) {
        const row = specificResult.rows[0];
        console.log(`\nFound: ${row.nsn} with last segment: "${row.last_segment}"`);
        console.log(`This should be: 2990-00-000-0001 with last segment: "0001"`);
        
        // Check if it's actually a 5-character last segment
        if (row.last_segment.length === 5 && row.last_segment === '00001') {
          console.log('✅ This NSN needs to be corrected from 00001 to 0001');
          return true;
        }
      }
      
      return false;
    }
    
    console.log('Current NSN\t\t→ Corrected NSN\t\t(Last segment: current → corrected)');
    console.log('─'.repeat(85));
    result.rows.forEach(row => {
      console.log(`${row.nsn} → ${row.corrected_nsn}\t(${row.current_last_segment} → ${row.corrected_last_segment})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error previewing changes:', error.message);
    return false;
  }
}

async function fixSpecificNSN() {
  console.log('🔧 Fixing the specific NSN: 2990-00-000-00001 → 2990-00-000-0001\n');
  
  const updateQuery = `
    UPDATE nsn_with_inc 
    SET nsn = '2990-00-000-0001'
    WHERE nsn = '2990-00-000-00001';
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery);
    client.release();
    
    console.log(`✅ Successfully updated ${result.rowCount} NSN record.`);
    return result.rowCount;
  } catch (error) {
    console.error('❌ Error updating NSN:', error.message);
    throw error;
  }
}

async function verifyFix() {
  console.log('🔍 Verifying the fix...\n');
  
  try {
    const client = await pool.connect();
    
    // Check if the corrected NSN exists
    const query1 = `SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-0001';`;
    const result1 = await client.query(query1);
    
    if (result1.rows.length > 0) {
      console.log('✅ SUCCESS: Found 2990-00-000-0001');
    } else {
      console.log('❌ 2990-00-000-0001 not found');
    }
    
    // Check if the old NSN is gone
    const query2 = `SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-00001';`;
    const result2 = await client.query(query2);
    
    if (result2.rows.length === 0) {
      console.log('✅ SUCCESS: Old format 2990-00-000-00001 is gone');
    } else {
      console.log('❌ Old format 2990-00-000-00001 still exists');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error verifying:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting specific NSN correction...\n');
    
    // Check if we need to fix anything
    const needsFix = await previewCorrection();
    if (!needsFix) {
      console.log('No corrections needed.');
      return;
    }
    
    // Confirm before proceeding
    if (process.argv.includes('--confirm')) {
      await fixSpecificNSN();
      await verifyFix();
    } else {
      console.log('💡 To execute the update, run: node scripts/fix_specific_pattern.js --confirm');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();