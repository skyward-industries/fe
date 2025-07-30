import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSummaries() {
  const client = await pool.connect();
  
  try {
    console.log('=== CHECKING GENERATED SUMMARIES ===\n');
    
    // 1. Count total summaries
    const countResult = await client.query(`
      SELECT COUNT(*) as total_summaries 
      FROM product_ai_descriptions
    `);
    
    console.log(`Total summaries generated: ${countResult.rows[0].total_summaries}`);
    
    // 2. Show sample summaries
    console.log('\n--- SAMPLE SUMMARIES ---');
    const sampleResult = await client.query(`
      SELECT 
        nsn,
        SUBSTRING(ai_summary, 1, 200) || '...' as summary_preview,
        meta_description,
        generated_at,
        updated_at
      FROM product_ai_descriptions
      ORDER BY generated_at DESC
      LIMIT 5
    `);
    
    sampleResult.rows.forEach((row, idx) => {
      console.log(`\n${idx + 1}. NSN: ${row.nsn}`);
      console.log(`   Summary: ${row.summary_preview}`);
      console.log(`   Meta: ${row.meta_description}`);
      console.log(`   Generated: ${row.generated_at}`);
    });
    
    // 3. Check summary statistics
    console.log('\n--- SUMMARY STATISTICS ---');
    const statsResult = await client.query(`
      SELECT 
        AVG(LENGTH(ai_summary)) as avg_summary_length,
        MIN(LENGTH(ai_summary)) as min_summary_length,
        MAX(LENGTH(ai_summary)) as max_summary_length,
        AVG(LENGTH(meta_description)) as avg_meta_length
      FROM product_ai_descriptions
    `);
    
    const stats = statsResult.rows[0];
    console.log(`Average summary length: ${Math.round(stats.avg_summary_length)} characters`);
    console.log(`Min summary length: ${stats.min_summary_length} characters`);
    console.log(`Max summary length: ${stats.max_summary_length} characters`);
    console.log(`Average meta description length: ${Math.round(stats.avg_meta_length)} characters`);
    
    // 4. Check for any NSNs that might have been skipped
    console.log('\n--- COVERAGE CHECK ---');
    const coverageResult = await client.query(`
      SELECT COUNT(DISTINCT pi.nsn) as total_nsns,
             COUNT(DISTINCT aid.nsn) as nsns_with_summaries
      FROM part_info pi
      LEFT JOIN product_ai_descriptions aid ON pi.nsn = aid.nsn
    `);
    
    const coverage = coverageResult.rows[0];
    console.log(`Total NSNs in database: ${coverage.total_nsns}`);
    console.log(`NSNs with summaries: ${coverage.nsns_with_summaries}`);
    console.log(`Coverage: ${((coverage.nsns_with_summaries / coverage.total_nsns) * 100).toFixed(2)}%`);
    
    // 5. Show a random full summary
    console.log('\n--- RANDOM FULL SUMMARY EXAMPLE ---');
    const randomResult = await client.query(`
      SELECT nsn, ai_summary, meta_description
      FROM product_ai_descriptions
      ORDER BY RANDOM()
      LIMIT 1
    `);
    
    if (randomResult.rows.length > 0) {
      const random = randomResult.rows[0];
      console.log(`\nNSN: ${random.nsn}`);
      console.log(`\nFull Summary:\n${random.ai_summary}`);
      console.log(`\nMeta Description:\n${random.meta_description}`);
    }
    
  } catch (error) {
    console.error('Error checking summaries:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkSummaries();