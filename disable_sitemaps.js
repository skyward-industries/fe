#!/usr/bin/env node

/**
 * Emergency script to disable sitemap generation
 * This will return empty responses for all sitemap requests
 */

import { Pool } from 'pg';

// Use the same configuration as your app
const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function disableSitemaps() {
  let client;
  try {
    console.log('🚫 Disabling sitemap generation...');
    client = await pool.connect();
    
    // Create a temporary table to track disabled state
    await client.query(`
      CREATE TABLE IF NOT EXISTS sitemap_disabled (
        id SERIAL PRIMARY KEY,
        disabled_at TIMESTAMP DEFAULT NOW(),
        reason TEXT DEFAULT 'Emergency disable due to connection overload'
      )
    `);
    
    // Insert disable record
    await client.query(`
      INSERT INTO sitemap_disabled (reason) 
      VALUES ('Emergency disable - too many active connections')
    `);
    
    console.log('✅ Sitemap generation disabled');
    console.log('📝 Reason: Emergency disable due to connection overload');
    console.log('⏰ Disabled at:', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error disabling sitemaps:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the disable
disableSitemaps();