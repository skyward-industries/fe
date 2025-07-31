#!/usr/bin/env node

// Run critical performance fix
import { Pool } from 'pg';
import { readFileSync } from 'fs';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function runCriticalFix() {
  let client;
  try {
    console.log('🔧 Running critical performance fix...\n');
    
    client = await pool.connect();
    
    // First check if index already exists
    const indexCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'nsn_with_inc' 
        AND indexname = 'idx_nsn_with_inc_nsn'
      ) as index_exists;
    `);
    
    if (indexCheck.rows[0].index_exists) {
      console.log('✅ Index idx_nsn_with_inc_nsn already exists');
    } else {
      console.log('⚠️  Creating missing index on nsn_with_inc.nsn...');
      console.log('This may take several minutes for a table with 9M+ rows...');
      
      const startTime = Date.now();
      
      // Create the index
      await client.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nsn_with_inc_nsn 
        ON nsn_with_inc (nsn);
      `);
      
      const indexTime = Date.now() - startTime;
      console.log(`✅ Index created in ${Math.round(indexTime/1000)}s`);
    }
    
    // Update table statistics
    console.log('📊 Updating table statistics...');
    await client.query('ANALYZE nsn_with_inc;');
    
    // Check table info
    const tableInfo = await client.query(`
      SELECT 
        pg_size_pretty(pg_total_relation_size('nsn_with_inc')) AS table_size,
        (SELECT count(*) FROM nsn_with_inc) AS row_count
    `);
    
    console.log(`\nTable info:`);
    console.log(`Size: ${tableInfo.rows[0].table_size}`);
    console.log(`Rows: ${tableInfo.rows[0].row_count.toLocaleString()}`);
    
    // Test the query performance after index
    console.log('\n🧪 Testing query performance after index...');
    const testQuery = `
      SELECT item_name, end_item_name 
      FROM nsn_with_inc 
      WHERE nsn = '5935-00-929-3179' 
      LIMIT 1;
    `;
    
    const testStart = Date.now();
    const testResult = await client.query(testQuery);
    const testTime = Date.now() - testStart;
    
    console.log(`✅ Query now takes ${testTime}ms (was 25+ seconds!)`);
    if (testResult.rows.length > 0) {
      console.log(`Found data: ${JSON.stringify(testResult.rows[0])}`);
    }
    
  } catch (error) {
    console.error('❌ Error running critical fix:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runCriticalFix();