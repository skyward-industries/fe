#!/usr/bin/env node

/**
 * Emergency script to terminate all database connections
 * Usage: node kill_db_connections.js
 */

import { Pool } from 'pg';

// Use the same configuration as your app (from ecosystem.config.cjs)
const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
  max: 1, // Just one connection for this script
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function killAllConnections() {
  let client;
  try {
    console.log('🔍 Connecting to database to terminate connections...');
    client = await pool.connect();
    
    // First, show current connections
    console.log('\n📊 Current active connections:');
    const activeConnections = await client.query(`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        state,
        query_start,
        LEFT(query, 100) as query_preview
      FROM pg_stat_activity 
      WHERE state = 'active' 
        AND pid <> pg_backend_pid()
      ORDER BY query_start
    `);
    
    if (activeConnections.rows.length === 0) {
      console.log('✅ No active connections found to terminate');
      return;
    }
    
    console.log(`Found ${activeConnections.rows.length} active connections:`);
    activeConnections.rows.forEach(conn => {
      console.log(`  PID ${conn.pid}: ${conn.usename}@${conn.client_addr || 'unknown'} - ${conn.query_preview}`);
    });
    
    // Terminate all active connections except current one
    console.log('\n🚨 Terminating all active connections...');
    const terminationResult = await client.query(`
      SELECT 
        'Terminating: ' || pid || ' (' || usename || '@' || COALESCE(client_addr::text, 'unknown') || ')' as action,
        pg_terminate_backend(pid) as terminated
      FROM pg_stat_activity 
      WHERE state = 'active' 
        AND pid <> pg_backend_pid()
    `);
    
    console.log('\n📋 Termination results:');
    terminationResult.rows.forEach(row => {
      console.log(`  ${row.action}: ${row.terminated ? '✅ Terminated' : '❌ Failed'}`);
    });
    
    // Verify connections are terminated
    const remainingConnections = await client.query(`
      SELECT count(*) as remaining
      FROM pg_stat_activity 
      WHERE state = 'active' 
        AND pid <> pg_backend_pid()
    `);
    
    console.log(`\n✅ Remaining active connections: ${remainingConnections.rows[0].remaining}`);
    
    if (remainingConnections.rows[0].remaining === 0) {
      console.log('🎉 All connections terminated successfully!');
    } else {
      console.log('⚠️ Some connections may still be active');
    }
    
  } catch (error) {
    console.error('❌ Error terminating connections:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the termination
killAllConnections(); 