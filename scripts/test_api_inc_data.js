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

async function testIncData() {
  try {
    const client = await pool.connect();
    
    const nsn = '2990-00-000-0001';
    console.log(`🔍 Testing enriched data for NSN: ${nsn}\n`);
    
    // Run the same query as the API
    const query = `
      SELECT 
        pi.nsn,
        nwi.inc,
        nwi.item_name,
        nwi.sos as ni_sos,
        nwi.end_item_name,
        inc_master.inc_status,
        inc_master.fiig,
        inc_master.app_key,
        inc_master.concept_no,
        inc_master.type_code,
        inc_master.cond_code,
        inc_master.definition as inc_definition
      FROM part_info pi
      LEFT JOIN nsn_with_inc nwi ON pi.nsn = nwi.nsn
      LEFT JOIN v_h6_name_inc inc_master ON nwi.inc::text = inc_master.inc
      WHERE pi.nsn = $1
      LIMIT 1;
    `;
    
    const result = await client.query(query, [nsn]);
    
    if (result.rows.length > 0) {
      const data = result.rows[0];
      console.log('📋 NSN Data:');
      console.log('─'.repeat(50));
      console.log(`NSN: ${data.nsn}`);
      console.log(`INC: ${data.inc}`);
      console.log(`Item Name: ${data.item_name}`);
      console.log(`End Item Name: ${data.end_item_name || 'N/A'}`);
      console.log(`SOS: ${data.ni_sos || 'N/A'}`);
      
      console.log('\n📋 INC Master Data:');
      console.log('─'.repeat(50));
      console.log(`INC Status: ${data.inc_status || 'N/A'}`);
      console.log(`FIIG: ${data.fiig || 'N/A'}`);
      console.log(`App Key: ${data.app_key || 'N/A'}`);
      console.log(`Type Code: ${data.type_code || 'N/A'}`);
      console.log(`Definition: ${data.inc_definition || 'N/A'}`);
    } else {
      console.log('No data found');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testIncData();