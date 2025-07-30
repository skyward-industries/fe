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

async function checkINCData() {
  try {
    const client = await pool.connect();
    
    const incCode = '77777';
    
    console.log(`🔍 Checking data for INC ${incCode}...\n`);
    
    // Check v_h6_name_inc
    console.log('📋 v_h6_name_inc (INC Master Data):');
    console.log('─'.repeat(80));
    
    const incMasterQuery = `
      SELECT * 
      FROM v_h6_name_inc 
      WHERE inc = $1
      LIMIT 1;
    `;
    
    const incMasterResult = await client.query(incMasterQuery, [incCode]);
    
    if (incMasterResult.rows.length > 0) {
      const data = incMasterResult.rows[0];
      console.log(`INC: ${data.inc}`);
      console.log(`Status: ${data.inc_status}`);
      console.log(`FIIG: ${data.fiig}`);
      console.log(`App Key: ${data.app_key}`);
      console.log(`Concept No: ${data.concept_no}`);
      console.log(`Type Code: ${data.type_code}`);
      console.log(`Condition Code: ${data.cond_code}`);
      console.log(`Date Established/Cancelled: ${data.dt_estb_canc}`);
      console.log(`Definition: ${data.definition || 'N/A'}`);
    } else {
      console.log('No data found in v_h6_name_inc');
    }
    
    // Check related_h6
    console.log('\n\n📋 related_h6 (Related INC items):');
    console.log('─'.repeat(80));
    
    const relatedQuery = `
      SELECT * 
      FROM related_h6 
      WHERE inc = $1
      LIMIT 5;
    `;
    
    const relatedResult = await client.query(relatedQuery, [incCode]);
    
    if (relatedResult.rows.length > 0) {
      console.log(`Found ${relatedResult.rows.length} related items:`);
      relatedResult.rows.forEach((row, idx) => {
        console.log(`\n${idx + 1}. Related INC: ${row.related_inc}`);
        console.log(`   Item Name: ${row.item_name}`);
      });
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM related_h6 WHERE inc = $1;`;
      const countResult = await client.query(countQuery, [incCode]);
      console.log(`\nTotal related items: ${countResult.rows[0].count}`);
    } else {
      console.log('No related items found in related_h6');
    }
    
    // Check what the definition looks like for a few INC codes
    console.log('\n\n📋 Sample INC definitions from v_h6_name_inc:');
    console.log('─'.repeat(80));
    
    const sampleQuery = `
      SELECT inc, SUBSTRING(definition FROM 1 FOR 100) as definition_preview
      FROM v_h6_name_inc 
      WHERE definition IS NOT NULL 
        AND definition != ''
      LIMIT 5;
    `;
    
    const sampleResult = await client.query(sampleQuery);
    
    sampleResult.rows.forEach(row => {
      console.log(`\nINC ${row.inc}: ${row.definition_preview}...`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkINCData();