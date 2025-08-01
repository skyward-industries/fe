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

async function checkDatabasePerformance() {
  try {
    console.log('🔍 Checking database performance and active queries...\n');
    
    // 1. Check for long-running queries
    console.log('1. 🕐 Long-running queries (>30 seconds):');
    const longQueries = await pool.query(`
      SELECT 
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query,
        state,
        client_addr
      FROM pg_stat_activity 
      WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
        AND query NOT LIKE '%pg_stat_activity%'
      ORDER BY duration DESC;
    `);
    
    if (longQueries.rows.length > 0) {
      console.log(`⚠️ Found ${longQueries.rows.length} long-running queries:`);
      longQueries.rows.forEach(row => {
        console.log(`   PID ${row.pid}: ${row.duration} - ${row.query.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ No long-running queries found');
    }
    
    // 2. Check for blocking queries
    console.log('\n2. 🚫 Blocking queries:');
    const blockingQueries = await pool.query(`
      SELECT
        blocked_locks.pid AS blocked_pid,
        blocked_activity.usename AS blocked_user,
        blocking_locks.pid AS blocking_pid,
        blocking_activity.usename AS blocking_user,
        blocked_activity.query AS blocked_statement,
        blocking_activity.query AS current_statement_in_blocking_process
      FROM pg_catalog.pg_locks blocked_locks
      JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
      JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
        AND blocking_locks.pid != blocked_locks.pid
      JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
      WHERE NOT blocked_locks.granted;
    `);
    
    if (blockingQueries.rows.length > 0) {
      console.log(`⚠️ Found ${blockingQueries.rows.length} blocking queries:`);
      blockingQueries.rows.forEach(row => {
        console.log(`   Blocked PID ${row.blocked_pid} by PID ${row.blocking_pid}`);
      });
    } else {
      console.log('✅ No blocking queries found');
    }
    
    // 3. Check connection count
    console.log('\n3. 🔗 Database connections:');
    const connections = await pool.query(`
      SELECT 
        state,
        count(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
      ORDER BY count DESC;
    `);
    
    console.log('Connection states:');
    connections.rows.forEach(row => {
      console.log(`   ${row.state}: ${row.count} connections`);
    });
    
    // 4. Check for indexes on NSN column
    console.log('\n4. 📊 Checking indexes on part_info table:');
    const indexes = await pool.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'part_info'
        AND indexdef LIKE '%nsn%'
      ORDER BY indexname;
    `);
    
    if (indexes.rows.length > 0) {
      console.log('NSN-related indexes:');
      indexes.rows.forEach(row => {
        console.log(`   ${row.indexname}: ${row.indexdef}`);
      });
    } else {
      console.log('⚠️ No NSN indexes found - this is likely the performance issue!');
    }
    
    // 5. Test query performance at different offsets
    console.log('\n5. 🏃 Testing query performance at different offsets:');
    
    const testOffsets = [0, 10000, 50000, 100000];
    
    for (const offset of testOffsets) {
      const start = Date.now();
      try {
        await pool.query(`
          SELECT nsn, fsg, fsc 
          FROM part_info 
          WHERE nsn IS NOT NULL 
            AND LENGTH(TRIM(nsn)) = 16
          ORDER BY nsn 
          LIMIT 10 OFFSET $1
        `, [offset]);
        
        const duration = Date.now() - start;
        console.log(`   Offset ${offset.toLocaleString()}: ${duration}ms`);
      } catch (error) {
        console.log(`   Offset ${offset.toLocaleString()}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabasePerformance();