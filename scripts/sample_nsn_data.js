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

async function checkNSNSamples() {
  try {
    const client = await pool.connect();
    
    // Get sample of NSNs with their length and format
    const query = `
      SELECT nsn, 
             LENGTH(nsn) as nsn_length,
             SUBSTRING(nsn FROM 15) as last_segment,
             LENGTH(SUBSTRING(nsn FROM 15)) as last_segment_length
      FROM nsn_with_inc 
      WHERE nsn IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 20;
    `;
    
    const result = await client.query(query);
    
    console.log('Sample NSN data:');
    console.log('NSN\t\t\t\tLength\tLast Segment\tLast Length');
    console.log('─'.repeat(70));
    
    result.rows.forEach(row => {
      console.log(`${row.nsn}\t\t${row.nsn_length}\t${row.last_segment}\t\t${row.last_segment_length}`);
    });
    
    // Check for NSNs that might have extra zeros specifically
    const problematicQuery = `
      SELECT nsn, 
             SUBSTRING(nsn FROM 15) as last_segment
      FROM nsn_with_inc 
      WHERE LENGTH(SUBSTRING(nsn FROM 15)) > 4
        AND nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]+$'
      LIMIT 10;
    `;
    
    const problematicResult = await client.query(problematicQuery);
    
    if (problematicResult.rows.length > 0) {
      console.log('\nNSNs with potentially extra zeros in last segment:');
      console.log('NSN\t\t\t\tLast Segment');
      console.log('─'.repeat(50));
      
      problematicResult.rows.forEach(row => {
        console.log(`${row.nsn}\t\t${row.last_segment}`);
      });
    } else {
      console.log('\nNo NSNs found with extra zeros in the last segment.');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkNSNSamples();