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

async function previewLeadingZeroFix() {
  console.log('🔍 Previewing NSNs with excessive leading zeros in last segment...\n');
  
  const query = `
    SELECT nsn,
           SUBSTRING(nsn FROM 1 FOR 13) || 
           LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0') as corrected_nsn,
           SUBSTRING(nsn FROM 14) as current_last_segment,
           LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0') as corrected_last_segment
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 17
      AND SUBSTRING(nsn FROM 14, 3) = '000'
      AND SUBSTRING(nsn FROM 17, 1) ~ '[1-9]'
      AND SUBSTRING(nsn FROM 14) != LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0')
    LIMIT 10;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length === 0) {
      console.log('✅ No NSNs found with excessive leading zeros.');
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

async function countExcessiveZeros() {
  const query = `
    SELECT COUNT(*) as count
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 17
      AND SUBSTRING(nsn FROM 14, 3) = '000'
      AND SUBSTRING(nsn FROM 17, 1) ~ '[1-9]'
      AND SUBSTRING(nsn FROM 14) != LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0');
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

async function fixLeadingZeros() {
  console.log('🔧 Fixing NSNs with excessive leading zeros...\n');
  
  const updateQuery = `
    UPDATE nsn_with_inc 
    SET nsn = SUBSTRING(nsn FROM 1 FOR 13) || 
              LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0')
    WHERE LENGTH(nsn) = 17
      AND SUBSTRING(nsn FROM 14, 3) = '000'
      AND SUBSTRING(nsn FROM 17, 1) ~ '[1-9]'
      AND SUBSTRING(nsn FROM 14) != LPAD(LTRIM(SUBSTRING(nsn FROM 14), '0'), 4, '0');
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

async function verifyTargetNSN() {
  console.log('🔍 Verifying the target NSN...\n');
  
  try {
    const client = await pool.connect();
    
    // Check if 2990-00-000-0001 now exists
    const query1 = `SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-0001';`;
    const result1 = await client.query(query1);
    
    if (result1.rows.length > 0) {
      console.log('✅ SUCCESS: Found 2990-00-000-0001');
    } else {
      console.log('❌ 2990-00-000-0001 not found');
    }
    
    // Check if 2990-00-000-00001 is gone
    const query2 = `SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-00001';`;
    const result2 = await client.query(query2);
    
    if (result2.rows.length === 0) {
      console.log('✅ SUCCESS: 2990-00-000-00001 is gone');
    } else {
      console.log('❌ 2990-00-000-00001 still exists');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error verifying:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting final fix for excessive leading zeros...\n');
    
    // Preview changes
    const hasChanges = await previewLeadingZeroFix();
    if (!hasChanges) {
      console.log('No corrections needed. Exiting.');
      return;
    }
    
    // Count affected records
    const count = await countExcessiveZeros();
    console.log(`\n📊 Total records that will be updated: ${count}\n`);
    
    // Confirm before proceeding
    if (process.argv.includes('--confirm')) {
      await fixLeadingZeros();
      await verifyTargetNSN();
    } else {
      console.log('💡 To execute the update, run: node scripts/final_fix_leading_zeros.js --confirm');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();