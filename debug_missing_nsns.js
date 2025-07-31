#!/usr/bin/env node

// Debug why specific NSNs are returning 404
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function debugMissingNSNs() {
  let client;
  try {
    console.log('🔍 Debugging NSNs that are returning 404...\n');
    
    client = await pool.connect();
    
    const testNSNs = [
      '5830-00-146-6591',
      '5310-01-183-1237',
      '5850-00-064-6405'
    ];
    
    for (const originalNSN of testNSNs) {
      const normalizedNSN = originalNSN.replace(/-/g, '');
      
      console.log(`Testing NSN: ${originalNSN} → ${normalizedNSN}`);
      
      // Test 1: Check if NSN exists in part_info at all
      const existsQuery = `
        SELECT nsn, COUNT(*) as count 
        FROM part_info 
        WHERE nsn = $1 OR REPLACE(nsn, '-', '') = $2
        GROUP BY nsn
      `;
      
      const existsResult = await client.query(existsQuery, [originalNSN, normalizedNSN]);
      console.log(`  Exists check: Found ${existsResult.rows.length} matching NSN variations`);
      
      if (existsResult.rows.length > 0) {
        existsResult.rows.forEach(row => {
          console.log(`    NSN: ${row.nsn}, Count: ${row.count}`);
        });
      }
      
      // Test 2: Try the EXACT query from my optimized getPartsByNSN
      const optimizedQuery = `
        SELECT
          pi.nsn, pi.fsg, pi.fsc, pi.niin,
          fsgs.fsg_title, fsgs.fsc_title,
          pn.part_number, pn.cage_code
        FROM public.part_info pi
        LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
        LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
        WHERE pi.nsn = $1;
      `;
      
      const optimizedResult = await client.query(optimizedQuery, [normalizedNSN]);
      console.log(`  Optimized query result: ${optimizedResult.rows.length} rows`);
      
      // Test 3: Try the OLD query format (with REPLACE)
      const oldQuery = `
        SELECT nsn, fsg, fsc, niin
        FROM part_info 
        WHERE REPLACE(nsn, '-', '') = $1
        LIMIT 5
      `;
      
      const oldResult = await client.query(oldQuery, [normalizedNSN]);
      console.log(`  Old REPLACE query result: ${oldResult.rows.length} rows`);
      
      if (oldResult.rows.length > 0) {
        console.log(`    Found with REPLACE: ${oldResult.rows[0].nsn}`);
      }
      
      console.log('  ---');
    }
    
  } catch (error) {
    console.error('Error debugging NSNs:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

debugMissingNSNs();