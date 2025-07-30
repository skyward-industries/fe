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

async function checkNSNData() {
  try {
    const client = await pool.connect();
    
    const nsn = '2990-00-000-0001';
    console.log(`🔍 Checking NSN ${nsn} in various tables...\n`);
    
    // Check nsn_with_inc
    const nsnIncQuery = `SELECT nsn, inc, item_name FROM nsn_with_inc WHERE nsn = $1;`;
    const nsnIncResult = await client.query(nsnIncQuery, [nsn]);
    
    console.log('📋 nsn_with_inc table:');
    if (nsnIncResult.rows.length > 0) {
      console.log(`✅ Found: NSN=${nsnIncResult.rows[0].nsn}, INC=${nsnIncResult.rows[0].inc}, Item=${nsnIncResult.rows[0].item_name}`);
    } else {
      console.log('❌ Not found');
    }
    
    // Check part_info
    const partInfoQuery = `SELECT nsn, niin FROM part_info WHERE nsn = $1;`;
    const partInfoResult = await client.query(partInfoQuery, [nsn]);
    
    console.log('\n📋 part_info table:');
    if (partInfoResult.rows.length > 0) {
      console.log(`✅ Found: NSN=${partInfoResult.rows[0].nsn}, NIIN=${partInfoResult.rows[0].niin}`);
    } else {
      console.log('❌ Not found');
    }
    
    // Check part_numbers
    const partNumQuery = `SELECT nsn, part_number, cage_code FROM part_numbers WHERE nsn = $1 LIMIT 3;`;
    const partNumResult = await client.query(partNumQuery, [nsn]);
    
    console.log('\n📋 part_numbers table:');
    if (partNumResult.rows.length > 0) {
      partNumResult.rows.forEach(row => {
        console.log(`✅ Found: P/N=${row.part_number}, CAGE=${row.cage_code}`);
      });
    } else {
      console.log('❌ Not found');
    }
    
    // Find an NSN that exists in both tables
    console.log('\n\n🔍 Finding NSNs that exist in both part_info and nsn_with_inc with INC data...\n');
    
    const bothTablesQuery = `
      SELECT pi.nsn, nwi.inc, nwi.item_name
      FROM part_info pi
      INNER JOIN nsn_with_inc nwi ON pi.nsn = nwi.nsn
      WHERE nwi.inc IS NOT NULL
        AND nwi.inc = '77777'
      LIMIT 5;
    `;
    
    const bothResult = await client.query(bothTablesQuery);
    
    if (bothResult.rows.length > 0) {
      console.log('Sample NSNs with INC 77777 in both tables:');
      bothResult.rows.forEach(row => {
        console.log(`  NSN: ${row.nsn}, INC: ${row.inc}, Item: ${row.item_name}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkNSNData();