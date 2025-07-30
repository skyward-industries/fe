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

async function findTestNSN() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Finding test NSN with INC data...\n');
    
    // Find an NSN with INC 10013 in part_info
    const query = `
      SELECT 
        pi.nsn,
        nwi.inc,
        nwi.item_name,
        pn.part_number,
        pn.cage_code
      FROM part_info pi
      INNER JOIN nsn_with_inc nwi ON pi.nsn = nwi.nsn
      INNER JOIN part_numbers pn ON pi.nsn = pn.nsn
      WHERE nwi.inc = 10013
        AND LENGTH(pi.nsn) = 17
      LIMIT 1;
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('Found test NSN:');
      console.log(`NSN: ${row.nsn}`);
      console.log(`INC: ${row.inc}`);
      console.log(`Item Name: ${row.item_name}`);
      console.log(`Part Number: ${row.part_number}`);
      console.log(`CAGE Code: ${row.cage_code}`);
      
      console.log(`\n🌐 View this part at: http://localhost:3000/catalog/15/AIRCRAFT_AND_AIRFRAME_STRUCTURAL_COMPONENTS/1560/AIRFRAME_STRUCTURAL_COMPONENTS/${row.nsn}`);
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findTestNSN();