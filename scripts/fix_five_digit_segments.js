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

async function previewFiveDigitFix() {
  console.log('🔍 Previewing NSNs with 5-digit last segments that need fixing...\n');
  
  const query = `
    SELECT nsn,
           SUBSTRING(nsn FROM 1 FOR 13) || LTRIM(SUBSTRING(nsn FROM 14), '0') as corrected_nsn,
           SUBSTRING(nsn FROM 14) as current_last_segment,
           LTRIM(SUBSTRING(nsn FROM 14), '0') as corrected_last_segment
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 18
      AND SUBSTRING(nsn FROM 14) ~ '^0000[1-9]$'
    LIMIT 20;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length === 0) {
      console.log('✅ No NSNs found with 5-digit 0000X pattern that need correction.');
      return false;
    }
    
    console.log('Current NSN\t\t\t→ Corrected NSN\t\t(Last segment: current → corrected)');
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

async function countFiveDigitRecords() {
  const query = `
    SELECT COUNT(*) as count
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 18
      AND SUBSTRING(nsn FROM 14) ~ '^0000[1-9]$';
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('❌ Error counting records:', error.message);
    return 0;
  }
}

async function updateFiveDigitSegments() {
  console.log('🔧 Fixing NSNs with 5-digit last segments...\n');
  
  const updateQuery = `
    UPDATE nsn_with_inc 
    SET nsn = SUBSTRING(nsn FROM 1 FOR 13) || LTRIM(SUBSTRING(nsn FROM 14), '0')
    WHERE LENGTH(nsn) = 18
      AND SUBSTRING(nsn FROM 14) ~ '^0000[1-9]$';
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery);
    client.release();
    
    console.log(`✅ Successfully updated ${result.rowCount} NSN records.`);
    return result.rowCount;
  } catch (error) {
    console.error('❌ Error updating NSN values:', error.message);
    throw error;
  }
}

async function verifySpecificNSN() {
  console.log('🔍 Verifying the specific NSN...\n');
  
  const query = `
    SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-0001';
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length > 0) {
      console.log('✅ SUCCESS: Found 2990-00-000-0001 in correct format!');
    } else {
      console.log('❌ 2990-00-000-0001 still not found. Checking what we have...');
      
      const checkQuery = `
        SELECT nsn FROM nsn_with_inc WHERE nsn LIKE '2990-00-000-0000%' LIMIT 5;
      `;
      
      const checkResult = await client.query(checkQuery);
      checkResult.rows.forEach(row => {
        console.log(`   Found: ${row.nsn}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting fix for 5-digit last segments...\n');
    
    // Preview changes
    const hasChanges = await previewFiveDigitFix();
    if (!hasChanges) {
      console.log('No 5-digit segment corrections needed. Exiting.');
      return;
    }
    
    // Count affected records
    const count = await countFiveDigitRecords();
    console.log(`\n📊 Total records that will be updated: ${count}\n`);
    
    // Confirm before proceeding
    if (process.argv.includes('--confirm')) {
      await updateFiveDigitSegments();
      await verifySpecificNSN();
    } else {
      console.log('💡 To execute the update, run: node scripts/fix_five_digit_segments.js --confirm');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();