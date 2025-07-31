#!/usr/bin/env node

// Quick script to check current index creation status
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',  
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function checkIndexStatus() {
  try {
    console.log('Checking current index creation status...');
    
    // Check for active CREATE INDEX operations
    const activeIndexQuery = `
      SELECT 
        pid,
        now() - query_start AS duration,
        query,
        state,
        wait_event_type,
        wait_event
      FROM pg_stat_activity 
      WHERE query LIKE '%CREATE INDEX%' 
      AND state = 'active';
    `;
    
    const result = await pool.query(activeIndexQuery);
    
    if (result.rows.length === 0) {
      console.log('No active CREATE INDEX operations found.');
    } else {
      console.log('Active CREATE INDEX operations:');
      result.rows.forEach(row => {
        console.log(`PID: ${row.pid}`);
        console.log(`Duration: ${row.duration}`);
        console.log(`State: ${row.state}`);
        console.log(`Wait Event: ${row.wait_event_type}/${row.wait_event}`);
        console.log(`Query: ${row.query.substring(0, 100)}...`);
        console.log('---');
      });
    }
    
    // Check char_data table size
    const sizeQuery = `
      SELECT 
        pg_size_pretty(pg_total_relation_size('char_data')) AS table_size,
        pg_size_pretty(pg_relation_size('char_data')) AS data_size,
        (SELECT count(*) FROM char_data) AS row_count
    `;
    
    const sizeResult = await pool.query(sizeQuery);
    console.log('\nchar_data table info:');
    console.log(`Table size: ${sizeResult.rows[0].table_size}`);
    console.log(`Data size: ${sizeResult.rows[0].data_size}`);
    console.log(`Row count: ${sizeResult.rows[0].row_count}`);
    
  } catch (error) {
    console.error('Error checking index status:', error);
  } finally {
    await pool.end();
  }
}

checkIndexStatus();