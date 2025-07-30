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

async function checkCurrentState() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Checking current state of NSNs starting with 2990-00-000-000...\n');
    
    const query = `
      SELECT nsn, 
             LENGTH(nsn) as length,
             SUBSTRING(nsn FROM 14) as last_segment,
             LENGTH(SUBSTRING(nsn FROM 14)) as last_segment_length
      FROM nsn_with_inc 
      WHERE nsn LIKE '2990-00-000-000%'
      ORDER BY nsn
      LIMIT 10;
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      console.log('NSN\t\t\tLength\tLast Segment\tLast Length\tShould Be');
      console.log('─'.repeat(80));
      
      result.rows.forEach(row => {
        let shouldBe = 'N/A';
        if (row.last_segment.startsWith('000') && row.last_segment.length === 4) {
          // Remove leading zeros and pad to 4 digits
          const trimmed = row.last_segment.replace(/^0+/, '');
          if (trimmed.length > 0) {
            shouldBe = '2990-00-000-' + trimmed.padStart(4, '0');
          }
        }
        console.log(`${row.nsn}\t${row.length}\t${row.last_segment}\t\t${row.last_segment_length}\t\t${shouldBe}`);
      });
    } else {
      console.log('No NSNs found starting with 2990-00-000-000');
    }
    
    // Also check for the exact case we're looking for
    console.log('\n🔍 Checking specific patterns...\n');
    
    const patterns = [
      '2990-00-000-00001',
      '2990-00-000-0001',
      '2990-00-000-010001'
    ];
    
    for (const pattern of patterns) {
      const checkQuery = `SELECT COUNT(*) as count FROM nsn_with_inc WHERE nsn = '${pattern}';`;
      const checkResult = await client.query(checkQuery);
      const count = checkResult.rows[0].count;
      console.log(`${pattern}: ${count > 0 ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCurrentState();