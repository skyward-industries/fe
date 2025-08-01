#!/usr/bin/env node

import pg from 'pg';

const { Pool } = pg;

// Set database configuration
process.env.NODE_ENV = 'production';
process.env.PGHOST = 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com';
process.env.PGPORT = '5432';
process.env.PGDATABASE = 'skyward';
process.env.PGUSER = 'postgres';
process.env.PGPASSWORD = 'Skyward_db_pw1234!';

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

async function killHangingQueries() {
  try {
    console.log('🔍 Finding and killing hanging queries...\n');
    
    // Find long-running queries
    const longQueries = await pool.query(`
      SELECT 
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query,
        state
      FROM pg_stat_activity 
      WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
        AND query NOT LIKE '%pg_stat_activity%'
        AND state = 'active'
      ORDER BY duration DESC;
    `);
    
    if (longQueries.rows.length > 0) {
      console.log(`⚠️ Found ${longQueries.rows.length} long-running queries to kill:`);
      
      for (const row of longQueries.rows) {
        console.log(`\nKilling PID ${row.pid} (running for ${row.duration}):`);
        console.log(`Query: ${row.query.substring(0, 100)}...`);
        
        try {
          await pool.query('SELECT pg_terminate_backend($1)', [row.pid]);
          console.log('✅ Successfully killed');
        } catch (error) {
          console.log(`❌ Failed to kill: ${error.message}`);
        }
      }
    } else {
      console.log('✅ No long-running queries found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

killHangingQueries();