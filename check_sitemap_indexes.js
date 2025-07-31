#!/usr/bin/env node

// Script to check indexes on tables used in sitemap generation
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function checkSitemapIndexes() {
  try {
    console.log('Checking indexes for sitemap generation...\n');

    // 1. Check indexes on part_info table
    const partInfoIndexes = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'part_info'
      ORDER BY indexname;
    `;
    
    const piResult = await pool.query(partInfoIndexes);
    console.log('Indexes on part_info table:');
    piResult.rows.forEach(row => {
      console.log(`  ${row.indexname}: ${row.indexdef}`);
    });
    console.log();

    // 2. Check if there's an index on part_info.id
    const idIndexCheck = `
      SELECT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'part_info' 
        AND indexdef LIKE '%id%'
      ) as has_id_index;
    `;
    
    const idResult = await pool.query(idIndexCheck);
    console.log(`Has index on part_info.id: ${idResult.rows[0].has_id_index ? '✅' : '❌'}`);
    console.log();

    // 3. Test the sitemap query performance
    console.log('Testing sitemap query performance...');
    const testQuery = `
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT 
        pi.fsg,
        pi.fsc,
        pi.nsn,
        COALESCE(fsgs.fsg_title, '') as fsg_title,
        COALESCE(fsgs.fsc_title, '') as fsc_title
      FROM part_info pi
      LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.id >= 700000 
        AND pi.id <= 702000
        AND pi.nsn IS NOT NULL 
        AND pi.nsn != ''
      ORDER BY pi.id
      LIMIT 2000;
    `;
    
    const explainResult = await pool.query(testQuery);
    console.log('\nQuery execution plan:');
    explainResult.rows.forEach(row => {
      console.log(`  ${row['QUERY PLAN']}`);
    });

    // 4. Check if we need an index on part_info.id
    const missingIndexes = `
      SELECT 
        'CREATE INDEX CONCURRENTLY idx_part_info_id_nsn ON part_info (id) WHERE nsn IS NOT NULL;' as suggested_index
      WHERE NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'part_info' 
        AND indexdef LIKE '%btree (id)%'
      );
    `;
    
    const missingResult = await pool.query(missingIndexes);
    if (missingResult.rows.length > 0) {
      console.log('\n⚠️  Suggested indexes for better performance:');
      missingResult.rows.forEach(row => {
        console.log(`  ${row.suggested_index}`);
      });
    }

  } catch (error) {
    console.error('Error checking indexes:', error);
  } finally {
    await pool.end();
  }
}

checkSitemapIndexes();