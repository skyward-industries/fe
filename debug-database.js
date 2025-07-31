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
process.env.PGSSLMODE = 'require';

const isProduction = process.env.NODE_ENV === 'production';
const isRds = (process.env.PGHOST || '').includes('amazonaws.com');

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isRds ? { rejectUnauthorized: false } : (isProduction ? { rejectUnauthorized: false } : false),
  max: 3,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database schema and data...');
    
    // Check if tables exist
    console.log('\n1. Checking if tables exist:');
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('part_info', 'wp_fsgs_new')
      ORDER BY table_name;
    `);
    console.log('Available tables:', tableCheck.rows.map(r => r.table_name));
    
    // Check part_info structure and sample data
    console.log('\n2. Checking part_info table:');
    const partInfoCount = await pool.query('SELECT COUNT(*) as total FROM part_info');
    console.log(`Total rows in part_info: ${partInfoCount.rows[0].total}`);
    
    const partInfoSample = await pool.query('SELECT nsn, fsg, fsc FROM part_info WHERE nsn IS NOT NULL LIMIT 5');
    console.log('Sample part_info data:', partInfoSample.rows);
    
    // Check wp_fsgs_new structure and sample data
    console.log('\n3. Checking wp_fsgs_new table:');
    const fsgsCount = await pool.query('SELECT COUNT(*) as total FROM wp_fsgs_new');
    console.log(`Total rows in wp_fsgs_new: ${fsgsCount.rows[0].total}`);
    
    const fsgsSample = await pool.query('SELECT fsg, fsc, fsg_title, fsc_title FROM wp_fsgs_new LIMIT 5');
    console.log('Sample wp_fsgs_new data:', fsgsSample.rows);
    
    // Test the original join query
    console.log('\n4. Testing the join query:');
    const joinTest = await pool.query(`
      SELECT COUNT(*) as total 
      FROM part_info pi
      JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.nsn IS NOT NULL 
        AND pi.fsg IS NOT NULL 
        AND pi.fsc IS NOT NULL
        AND fsgs.fsg_title IS NOT NULL 
        AND fsgs.fsc_title IS NOT NULL
    `);
    console.log(`Join query result: ${joinTest.rows[0].total} rows`);
    
    // Test without length restriction
    console.log('\n5. Testing join without NSN length restriction:');
    const joinTestNoLength = await pool.query(`
      SELECT COUNT(*) as total 
      FROM part_info pi
      JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.nsn IS NOT NULL 
        AND pi.fsg IS NOT NULL 
        AND pi.fsc IS NOT NULL
        AND fsgs.fsg_title IS NOT NULL 
        AND fsgs.fsc_title IS NOT NULL
    `);
    console.log(`Join without length check: ${joinTestNoLength.rows[0].total} rows`);
    
    // Check NSN lengths
    console.log('\n6. Checking NSN lengths:');
    const nsnLengths = await pool.query(`
      SELECT LENGTH(TRIM(nsn)) as nsn_length, COUNT(*) as count
      FROM part_info 
      WHERE nsn IS NOT NULL
      GROUP BY LENGTH(TRIM(nsn))
      ORDER BY nsn_length;
    `);
    console.log('NSN length distribution:', nsnLengths.rows);
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await pool.end();
  }
}

debugDatabase();