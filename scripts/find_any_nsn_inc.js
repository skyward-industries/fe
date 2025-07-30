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

async function findAnyNSN() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Finding any NSN with potential INC master data...\n');
    
    // Find NSNs with INC values that might have master data
    const query = `
      SELECT 
        pi.nsn,
        pi.fsg,
        pi.fsc,
        nwi.inc,
        nwi.item_name,
        v_inc.inc_status,
        v_inc.definition,
        pn.part_number,
        pn.cage_code
      FROM part_info pi
      INNER JOIN nsn_with_inc nwi ON pi.nsn = nwi.nsn
      INNER JOIN part_numbers pn ON pi.nsn = pn.nsn
      LEFT JOIN v_h6_name_inc v_inc ON (
        nwi.inc::text = v_inc.inc 
        OR LPAD(nwi.inc::text, 5, '0') = v_inc.inc
      )
      WHERE nwi.inc IS NOT NULL
        AND LENGTH(pi.nsn) = 17
        AND v_inc.definition IS NOT NULL
      ORDER BY LENGTH(v_inc.definition) DESC
      LIMIT 3;
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      console.log('Found NSNs with INC master data:');
      console.log('─'.repeat(80));
      
      result.rows.forEach((row, idx) => {
        console.log(`\n${idx + 1}. NSN: ${row.nsn}`);
        console.log(`   INC: ${row.inc}`);
        console.log(`   Item Name: ${row.item_name}`);
        console.log(`   Part Number: ${row.part_number}`);
        console.log(`   CAGE Code: ${row.cage_code}`);
        console.log(`   INC Status: ${row.inc_status}`);
        console.log(`   Definition: ${row.definition.substring(0, 100)}...`);
        console.log(`   \n   🌐 URL: http://localhost:3000/catalog/${row.fsg}/GROUP/${row.fsc}/SUBGROUP/${row.nsn}`);
      });
    } else {
      console.log('No NSNs found with INC master data');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findAnyNSN();