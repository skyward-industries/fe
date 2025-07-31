#!/usr/bin/env node

// Script to verify index creation was successful
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function verifyIndexSuccess() {
  try {
    console.log('Checking index creation status...\n');

    // 1. Check if there are any active CREATE INDEX operations
    const activeQuery = `
      SELECT 
        pid,
        now() - query_start AS duration,
        query,
        state
      FROM pg_stat_activity 
      WHERE query LIKE '%CREATE INDEX%' 
      AND state = 'active'
    `;
    
    const activeResult = await pool.query(activeQuery);
    
    if (activeResult.rows.length > 0) {
      console.log('⚠️  Still active CREATE INDEX operations:');
      activeResult.rows.forEach(row => {
        console.log(`  PID: ${row.pid}, Duration: ${row.duration}`);
      });
      console.log();
    } else {
      console.log('✅ No active CREATE INDEX operations\n');
    }

    // 2. Check if the idx_char_data_niin index exists and is valid
    const indexQuery = `
      SELECT 
        n.nspname AS schemaname,
        t.relname AS tablename,
        i.relname AS indexname,
        pg_get_indexdef(x.indexrelid) AS indexdef,
        pg_size_pretty(pg_relation_size(i.oid)) AS indexsize
      FROM pg_index x
      JOIN pg_class i ON i.oid = x.indexrelid
      JOIN pg_class t ON t.oid = x.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE i.relname = 'idx_char_data_niin'
    `;
    
    const indexResult = await pool.query(indexQuery);
    
    if (indexResult.rows.length > 0) {
      console.log('✅ Index idx_char_data_niin exists:');
      indexResult.rows.forEach(row => {
        console.log(`  Schema: ${row.schemaname}`);
        console.log(`  Table: ${row.tablename}`);
        console.log(`  Index: ${row.indexname}`);
        console.log(`  Size: ${row.indexsize}`);
        console.log(`  Definition: ${row.indexdef}`);
      });
      console.log();
    } else {
      console.log('❌ Index idx_char_data_niin does not exist\n');
    }

    // 3. Check index validity (for CONCURRENT indexes that might have failed)
    const validityQuery = `
      SELECT 
        i.relname AS index_name,
        indisvalid AS is_valid,
        indisready AS is_ready
      FROM pg_index x
      JOIN pg_class i ON i.oid = x.indexrelid
      WHERE i.relname = 'idx_char_data_niin'
    `;
    
    const validityResult = await pool.query(validityQuery);
    
    if (validityResult.rows.length > 0) {
      const row = validityResult.rows[0];
      console.log('Index validity status:');
      console.log(`  Valid: ${row.is_valid ? '✅' : '❌'}`);
      console.log(`  Ready: ${row.is_ready ? '✅' : '❌'}`);
      
      if (!row.is_valid || !row.is_ready) {
        console.log('⚠️  Index may have failed during CONCURRENT creation');
      }
      console.log();
    }

    // 4. Test a simple query using the index
    console.log('Testing index performance...');
    const testQuery = `
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT niin, mrc 
      FROM char_data 
      WHERE niin = '000000001'
      LIMIT 1
    `;
    
    const testResult = await pool.query(testQuery);
    console.log('\nQuery execution plan:');
    testResult.rows.forEach(row => {
      console.log(`  ${row['QUERY PLAN']}`);
    });

  } catch (error) {
    console.error('Error verifying index:', error);
  } finally {
    await pool.end();
  }
}

verifyIndexSuccess();