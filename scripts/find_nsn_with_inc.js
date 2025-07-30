#!/usr/bin/env node

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

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

async function findNSNWithINC() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Finding NSNs with INC data that exist in both tables...\n');
    
    // Find NSNs that exist in both part_info and nsn_with_inc with INC data
    const query = `
      SELECT 
        pi.nsn,
        nwi.inc,
        nwi.item_name,
        inc_master.inc_status,
        inc_master.fiig,
        inc_master.definition
      FROM part_info pi
      INNER JOIN nsn_with_inc nwi ON pi.nsn = nwi.nsn
      LEFT JOIN v_h6_name_inc inc_master ON nwi.inc::text = inc_master.inc
      WHERE nwi.inc IS NOT NULL
        AND LENGTH(pi.nsn) = 17
      ORDER BY 
        CASE WHEN inc_master.definition IS NOT NULL THEN 0 ELSE 1 END,
        pi.nsn
      LIMIT 5;
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      console.log('Found NSNs with INC data:');
      console.log('─'.repeat(80));
      
      for (const row of result.rows) {
        console.log(`\nNSN: ${row.nsn}`);
        console.log(`INC: ${row.inc}`);
        console.log(`Item Name: ${row.item_name}`);
        console.log(`INC Status: ${row.inc_status || 'N/A'}`);
        console.log(`FIIG: ${row.fiig || 'N/A'}`);
        console.log(`Definition: ${row.definition ? row.definition.substring(0, 100) + '...' : 'N/A'}`);
        
        // Test the API with this NSN
        console.log('\n📡 Testing API response...');
        try {
          const apiUrl = `http://localhost:3000/api/partInfo/enhanced/${row.nsn}`;
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0 && data[0].inc_details) {
              console.log('✅ API returned INC details:', JSON.stringify(data[0].inc_details, null, 2));
              if (data[0].related_inc_items) {
                console.log('✅ Related INC items:', data[0].related_inc_items.length);
              }
            } else {
              console.log('❌ No INC details in API response');
            }
          } else {
            console.log('❌ API request failed:', response.status);
          }
        } catch (err) {
          console.log('⚠️  Could not test API (server might not be running)');
        }
        
        console.log('─'.repeat(80));
        break; // Just test the first one
      }
    } else {
      console.log('No NSNs found with INC data in both tables');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findNSNWithINC();