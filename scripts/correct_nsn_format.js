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
  console.log('🔍 Previewing NSN format corrections...\n');
  
  const query = `
    SELECT 
      nsn,
      CASE 
        -- For NSNs that are 18 characters (xxxx-xx-xxx-xxxxxx format)
        WHEN LENGTH(nsn) = 18 AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$' THEN
          SUBSTRING(nsn FROM 1 FOR 13) || 
          LPAD(LTRIM(SUBSTRING(nsn FROM 15), '0'), 4, '0')
        -- For other malformed NSNs, try to extract and reformat
        ELSE nsn
      END as corrected_nsn,
      LENGTH(nsn) as current_length,
      SUBSTRING(nsn FROM 15) as current_last_segment
    FROM nsn_with_inc 
    WHERE 
      -- Find NSNs that need correction (not in xxxx-xx-xxx-xxxx format)
      (LENGTH(nsn) != 17 OR nsn !~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')
      AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$'
    LIMIT 10;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    
    if (result.rows.length === 0) {
      console.log('✅ No NSN values found that need format correction.');
      return false;
    }
    
    console.log('Current NSN (Length)\t\t→ Corrected NSN\t\t(Last Segment → Corrected)');
    console.log('─'.repeat(90));
    result.rows.forEach(row => {
      const correctedLastSeg = row.corrected_nsn.substring(13);
      console.log(`${row.nsn} (${row.current_length})\t→ ${row.corrected_nsn}\t(${row.current_last_segment} → ${correctedLastSeg})`);
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
    WHERE 
      (LENGTH(nsn) != 17 OR nsn !~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')
      AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$';
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

async function updateNSNFormat() {
  console.log('🔧 Correcting NSN format to xxxx-xx-xxx-xxxx...\n');
  
  const updateQuery = `
    UPDATE nsn_with_inc 
    SET nsn = CASE 
      -- For NSNs that are 18 characters (xxxx-xx-xxx-xxxxxx format)
      WHEN LENGTH(nsn) = 18 AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$' THEN
        SUBSTRING(nsn FROM 1 FOR 13) || 
        LPAD(LTRIM(SUBSTRING(nsn FROM 15), '0'), 4, '0')
      ELSE nsn
    END
    WHERE 
      (LENGTH(nsn) != 17 OR nsn !~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')
      AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$';
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(updateQuery);
    client.release();
    
    console.log(`✅ Successfully updated ${result.rowCount} NSN records to proper format.`);
    return result.rowCount;
  } catch (error) {
    console.error('❌ Error updating NSN format:', error.message);
    throw error;
  }
}

async function verifyFormat() {
  console.log('🔍 Verifying NSN format corrections...\n');
  
  // Check format distribution
  const formatQuery = `
    SELECT 
      CASE 
        WHEN LENGTH(nsn) = 17 AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{4}$' THEN 'Correct format (xxxx-xx-xxx-xxxx)'
        WHEN LENGTH(nsn) = 18 THEN 'Too long (18 chars)'
        WHEN LENGTH(nsn) < 17 THEN 'Too short (<17 chars)'
        ELSE 'Other format issue'
      END as format_status,
      COUNT(*) as count
    FROM nsn_with_inc 
    WHERE nsn IS NOT NULL
    GROUP BY 
      CASE 
        WHEN LENGTH(nsn) = 17 AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{4}$' THEN 'Correct format (xxxx-xx-xxx-xxxx)'
        WHEN LENGTH(nsn) = 18 THEN 'Too long (18 chars)'
        WHEN LENGTH(nsn) < 17 THEN 'Too short (<17 chars)'
        ELSE 'Other format issue'
      END
    ORDER BY count DESC;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(formatQuery);
    
    console.log('NSN Format Status:');
    result.rows.forEach(row => {
      console.log(`  ${row.format_status}: ${row.count} records`);
    });
    
    // Check specific example
    const exampleQuery = `
      SELECT nsn FROM nsn_with_inc WHERE nsn = '2990-00-000-0001' LIMIT 1;
    `;
    
    const exampleResult = await client.query(exampleQuery);
    if (exampleResult.rows.length > 0) {
      console.log(`\n✅ Confirmed: Found properly formatted NSN: ${exampleResult.rows[0].nsn}`);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Error verifying format:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting NSN format correction to xxxx-xx-xxx-xxxx...\n');
    
    // Preview changes
    const hasChanges = await previewChanges();
    if (!hasChanges) {
      console.log('No format corrections needed. Exiting.');
      return;
    }
    
    // Count affected records
    const count = await countAffectedRecords();
    console.log(`\n📊 Total records that will be updated: ${count}\n`);
    
    // Confirm before proceeding
    if (process.argv.includes('--confirm')) {
      await updateNSNFormat();
      await verifyFormat();
    } else {
      console.log('💡 To execute the update, run: node scripts/correct_nsn_format.js --confirm');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();