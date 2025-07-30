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

async function previewChanges() {
  console.log('🔍 Previewing NSN values that will be changed...\n');
  
  const query = `
    SELECT nsn,
           SUBSTRING(nsn FROM 1 FOR 13) || LTRIM(SUBSTRING(nsn FROM 15), '0') as corrected_nsn,
           SUBSTRING(nsn FROM 15) as current_last_segment,
           LTRIM(SUBSTRING(nsn FROM 15), '0') as corrected_last_segment
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 18
      AND SUBSTRING(nsn FROM 15) ~ '^00[0-9]+$'
      AND LENGTH(LTRIM(SUBSTRING(nsn FROM 15), '0')) = 4
    LIMIT 10;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length === 0) {
      console.log('✅ No NSN values found that need correction.');
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

async function countAffectedRecords() {
  const query = `
    SELECT COUNT(*) as count
    FROM nsn_with_inc 
    WHERE LENGTH(nsn) = 18
      AND SUBSTRING(nsn FROM 15) ~ '^00[0-9]+$'
      AND LENGTH(LTRIM(SUBSTRING(nsn FROM 15), '0')) = 4;
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

async function updateNSNValues() {
  console.log('🔧 Updating NSN values...\n');
  
  const updateQuery = `
    UPDATE nsn_with_inc 
    SET nsn = SUBSTRING(nsn FROM 1 FOR 13) || LTRIM(SUBSTRING(nsn FROM 15), '0')
    WHERE LENGTH(nsn) = 18
      AND SUBSTRING(nsn FROM 15) ~ '^00[0-9]+$'
      AND LENGTH(LTRIM(SUBSTRING(nsn FROM 15), '0')) = 4;
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

async function verifyChanges() {
  console.log('🔍 Verifying changes...\n');
  
  // Show some examples of the corrected NSNs
  const query = `
    SELECT nsn
    FROM nsn_with_inc 
    WHERE nsn = '8940-00-000-0042'
    LIMIT 5;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: Found corrected NSNs like 8940-00-000-0042');
    } else {
      console.log('⚠️  Could not find the expected corrected NSN format');
    }
  } catch (error) {
    console.error('❌ Error verifying changes:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting NSN correction process...\n');
    
    // Preview changes
    const hasChanges = await previewChanges();
    if (!hasChanges) {
      console.log('No changes needed. Exiting.');
      return;
    }
    
    // Count affected records
    const count = await countAffectedRecords();
    console.log(`\n📊 Total records that will be updated: ${count}\n`);
    
    // Confirm before proceeding
    if (process.argv.includes('--confirm')) {
      await updateNSNValues();
      await verifyChanges();
    } else {
      console.log('💡 To execute the update, run: node scripts/correct_nsn_update.js --confirm');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();