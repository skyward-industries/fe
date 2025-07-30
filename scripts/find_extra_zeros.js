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

async function findExtraZeros() {
  try {
    const client = await pool.connect();
    
    // Look for NSNs like 8940-00-000-000042 (with leading zeros in last segment)
    const query = `
      SELECT nsn, 
             LENGTH(nsn) as nsn_length,
             SUBSTRING(nsn FROM 15) as last_segment
      FROM nsn_with_inc 
      WHERE nsn LIKE '%000%'
        AND LENGTH(nsn) > 18
      LIMIT 20;
    `;
    
    console.log('Looking for NSNs with extra characters and zeros...\n');
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      console.log('Found NSNs with potential extra zeros:');
      console.log('NSN\t\t\t\t\tLength\tLast Segment');
      console.log('─'.repeat(60));
      
      result.rows.forEach(row => {
        console.log(`${row.nsn}\t${row.nsn_length}\t${row.last_segment}`);
      });
    } else {
      console.log('No NSNs found with length > 18 characters.');
    }
    
    // Also check for any NSNs that match your specific example pattern
    const specificQuery = `
      SELECT nsn, 
             LENGTH(nsn) as nsn_length
      FROM nsn_with_inc 
      WHERE nsn ~ '^[0-9]{4}-[0-9]{2}-[0-9]{3}-[0-9]{6,}$'
      LIMIT 10;
    `;
    
    const specificResult = await client.query(specificQuery);
    
    console.log('\nLooking for NSNs with 6+ digit last segments...');
    if (specificResult.rows.length > 0) {
      console.log('NSN\t\t\t\t\tLength');
      console.log('─'.repeat(40));
      specificResult.rows.forEach(row => {
        console.log(`${row.nsn}\t${row.nsn_length}`);
      });
    } else {
      console.log('No NSNs found with 6+ digit last segments.');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findExtraZeros();