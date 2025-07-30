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

async function analyzeNSN() {
  try {
    const client = await pool.connect();
    
    // Get the exact NSN and break it down character by character
    const query = `
      SELECT nsn,
             LENGTH(nsn) as total_length,
             SUBSTRING(nsn FROM 1 FOR 4) as part1,
             SUBSTRING(nsn FROM 6 FOR 2) as part2,
             SUBSTRING(nsn FROM 9 FOR 3) as part3,
             SUBSTRING(nsn FROM 13 FOR 1) as dash,
             SUBSTRING(nsn FROM 14) as last_part,
             LENGTH(SUBSTRING(nsn FROM 14)) as last_part_length
      FROM nsn_with_inc 
      WHERE nsn = '8940-00-000-000042'
      LIMIT 1;
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('Analysis of NSN: 8940-00-000-000042');
      console.log('─'.repeat(50));
      console.log(`Full NSN: "${row.nsn}"`);
      console.log(`Total length: ${row.total_length}`);
      console.log(`Part 1 (FSG): "${row.part1}"`);
      console.log(`Part 2 (FSC): "${row.part2}"`);
      console.log(`Part 3: "${row.part3}"`);
      console.log(`Dash: "${row.dash}"`);
      console.log(`Last part: "${row.last_part}"`);
      console.log(`Last part length: ${row.last_part_length}`);
      
      // Show what it should be if corrected
      if (row.last_part === '000042') {
        console.log(`\nShould be corrected to: 8940-00-000-0042`);
        console.log(`Correction needed: Remove one leading zero from "${row.last_part}" to make "0042"`);
      } else {
        console.log(`\nThis NSN appears to already be in correct format.`);
      }
      
    } else {
      console.log('NSN not found.');
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeNSN();