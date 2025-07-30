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

async function findSpecificPattern() {
  try {
    const client = await pool.connect();
    
    // Look for the exact pattern: 8940-00-000-000042
    console.log('Looking for NSNs matching the specific pattern you mentioned...\n');
    
    const exactQuery = `
      SELECT nsn
      FROM nsn_with_inc 
      WHERE nsn = '8940-00-000-000042'
      LIMIT 5;
    `;
    
    const exactResult = await client.query(exactQuery);
    
    if (exactResult.rows.length > 0) {
      console.log('Found the exact NSN: 8940-00-000-000042');
      console.log('This should be corrected to: 8940-00-000-0042\n');
    } else {
      console.log('The exact NSN 8940-00-000-000042 was not found.\n');
    }
    
    // Look for any NSNs that have 00 followed by 4 digits in the last segment
    const patternQuery = `
      SELECT nsn,
             SUBSTRING(nsn FROM 15) as last_segment,
             CASE 
               WHEN SUBSTRING(nsn FROM 15) ~ '^00[0-9]{4}$' THEN
                 SUBSTRING(nsn FROM 1 FOR 14) || LTRIM(SUBSTRING(nsn FROM 15), '0')
               ELSE nsn
             END as corrected_nsn
      FROM nsn_with_inc 
      WHERE SUBSTRING(nsn FROM 15) ~ '^00[0-9]{4}$'
        AND SUBSTRING(nsn FROM 15) != LTRIM(SUBSTRING(nsn FROM 15), '0')
      LIMIT 10;
    `;
    
    const patternResult = await client.query(patternQuery);
    
    if (patternResult.rows.length > 0) {
      console.log('Found NSNs with 00XXXX pattern that need correction:');
      console.log('Current NSN\t\t\tLast Segment\tCorrected NSN');
      console.log('─'.repeat(80));
      
      patternResult.rows.forEach(row => {
        console.log(`${row.nsn}\t${row.last_segment}\t\t${row.corrected_nsn}`);
      });
      
      console.log(`\nTotal count of records needing correction:`);
      const countQuery = `
        SELECT COUNT(*) as count
        FROM nsn_with_inc 
        WHERE SUBSTRING(nsn FROM 15) ~ '^00[0-9]{4}$'
          AND SUBSTRING(nsn FROM 15) != LTRIM(SUBSTRING(nsn FROM 15), '0');
      `;
      
      const countResult = await client.query(countQuery);
      console.log(`${countResult.rows[0].count} records`);
      
    } else {
      console.log('No NSNs found with the 00XXXX pattern that need correction.');
      
      // Show some examples of what we have
      const sampleQuery = `
        SELECT nsn, SUBSTRING(nsn FROM 15) as last_segment
        FROM nsn_with_inc 
        WHERE nsn LIKE '%-00%'
        LIMIT 5;
      `;
      
      const sampleResult = await client.query(sampleQuery);
      console.log('\nSample NSNs with 00 in them:');
      sampleResult.rows.forEach(row => {
        console.log(`${row.nsn} (last: ${row.last_segment})`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findSpecificPattern();