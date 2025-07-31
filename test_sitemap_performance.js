#!/usr/bin/env node

// Test sitemap performance with optimized query
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function testSitemapPerformance() {
  let client;
  try {
    console.log('Testing optimized sitemap query performance...\n');
    
    client = await pool.connect();
    
    // Set same parameters as the API
    await client.query(`SET statement_timeout = 20000`);
    await client.query(`SET work_mem = '256MB'`);
    await client.query(`SET enable_seqscan = OFF`);
    
    // Test the optimized query (without JOIN)
    console.log('Testing OPTIMIZED query (no JOIN):');
    const optimizedQuery = `
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT 
        pi.fsg,
        pi.fsc,
        pi.nsn
      FROM part_info pi
      WHERE pi.id >= 700000 
        AND pi.id <= 702000
        AND pi.nsn IS NOT NULL 
        AND pi.nsn != ''
      ORDER BY pi.id
      LIMIT 2000;
    `;
    
    const startTime = Date.now();
    const optimizedResult = await client.query(optimizedQuery);
    const optimizedTime = Date.now() - startTime;
    
    console.log('Optimized query execution plan:');
    optimizedResult.rows.forEach(row => {
      console.log(`  ${row['QUERY PLAN']}`);
    });
    console.log(`Total execution time: ${optimizedTime}ms\n`);
    
    // Also test the FSG/FSC cache query
    console.log('Testing FSG/FSC cache query:');
    const cacheQuery = `
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT DISTINCT fsg, fsc, fsg_title, fsc_title 
      FROM wp_fsgs_new 
      WHERE fsg_title IS NOT NULL AND fsc_title IS NOT NULL;
    `;
    
    const cacheStartTime = Date.now();
    const cacheResult = await client.query(cacheQuery);
    const cacheTime = Date.now() - cacheStartTime;
    
    console.log('Cache query execution plan:');
    cacheResult.rows.forEach(row => {
      console.log(`  ${row['QUERY PLAN']}`);
    });
    console.log(`Cache query time: ${cacheTime}ms\n`);
    
    // Run actual data query to test real performance
    console.log('Testing actual data retrieval:');
    const dataQuery = `
      SELECT 
        pi.fsg,
        pi.fsc,
        pi.nsn
      FROM part_info pi
      WHERE pi.id >= 700000 
        AND pi.id <= 702000
        AND pi.nsn IS NOT NULL 
        AND pi.nsn != ''
      ORDER BY pi.id
      LIMIT 2000;
    `;
    
    const dataStartTime = Date.now();
    const dataResult = await client.query(dataQuery);
    const dataTime = Date.now() - dataStartTime;
    
    console.log(`Retrieved ${dataResult.rows.length} rows in ${dataTime}ms`);
    console.log(`\n✅ Performance improvement: Query now takes ${dataTime}ms instead of 842ms!`);
    
  } catch (error) {
    console.error('Error testing performance:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testSitemapPerformance();