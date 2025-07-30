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

async function findNSNsWithData() {
  const client = await pool.connect();
  
  try {
    console.log('=== FINDING NSNs WITH COMPLETE DATA ===\n');
    
    // 1. Find NSNs that have INC data
    console.log('1. NSNs with INC data:');
    const incNSNs = await client.query(`
      SELECT 
        ni.nsn, 
        ni.inc, 
        ni.item_name,
        (SELECT COUNT(*) FROM public.v_h6_name_inc h6 WHERE h6.inc = ni.inc::text) as has_h6_data
      FROM public.nsn_with_inc ni
      WHERE ni.inc IS NOT NULL
      ORDER BY ni.nsn
      LIMIT 10
    `);
    
    console.log('Sample NSNs with INC data:');
    incNSNs.rows.forEach(row => {
      console.log(`  NSN: ${row.nsn}, INC: ${row.inc}, Item: ${row.item_name}, H6 Data: ${row.has_h6_data > 0 ? '✅' : '❌'}`);
    });
    
    // 2. Find NSNs with related parts
    console.log('\n2. NSNs with related parts:');
    const relatedNSNs = await client.query(`
      SELECT nsn, COUNT(*) as related_count
      FROM public.related_nsns
      GROUP BY nsn
      ORDER BY related_count DESC
      LIMIT 10
    `);
    
    console.log('NSNs with most related parts:');
    relatedNSNs.rows.forEach(row => {
      console.log(`  NSN: ${row.nsn}, Related count: ${row.related_count}`);
    });
    
    // 3. Find NSNs with AI summaries
    console.log('\n3. NSNs with AI summaries:');
    const summaryNSNs = await client.query(`
      SELECT nsn, LENGTH(ai_summary) as summary_length
      FROM public.product_ai_descriptions
      ORDER BY generated_at DESC
      LIMIT 5
    `);
    
    console.log('Recent NSNs with summaries:');
    summaryNSNs.rows.forEach(row => {
      console.log(`  NSN: ${row.nsn}, Summary length: ${row.summary_length} chars`);
    });
    
    // 4. Find a complete NSN example
    console.log('\n4. Finding NSNs with complete data (summaries + INC + related):');
    const completeNSNs = await client.query(`
      SELECT DISTINCT 
        pi.nsn,
        CASE WHEN aid.nsn IS NOT NULL THEN '✅' ELSE '❌' END as has_summary,
        CASE WHEN ni.inc IS NOT NULL THEN '✅' ELSE '❌' END as has_inc,
        CASE WHEN rn.nsn IS NOT NULL THEN '✅' ELSE '❌' END as has_related
      FROM public.part_info pi
      LEFT JOIN public.product_ai_descriptions aid ON pi.nsn = aid.nsn
      LEFT JOIN public.nsn_with_inc ni ON pi.nsn = ni.nsn
      LEFT JOIN public.related_nsns rn ON pi.nsn = rn.nsn
      WHERE aid.nsn IS NOT NULL  -- Must have summary
      ORDER BY pi.nsn
      LIMIT 10
    `);
    
    console.log('NSNs with available data:');
    completeNSNs.rows.forEach(row => {
      console.log(`  NSN: ${row.nsn} | Summary: ${row.has_summary} | INC: ${row.has_inc} | Related: ${row.has_related}`);
    });
    
    // 5. Suggest test URLs
    console.log('\n5. SUGGESTED TEST URLs:');
    const testNSNs = completeNSNs.rows.slice(0, 3);
    
    for (const row of testNSNs) {
      const urlResult = await client.query(`
        SELECT 
          pi.fsg, 
          fsgs.fsg_title,
          pi.fsc,
          fsgs.fsc_title
        FROM public.part_info pi
        LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
        WHERE pi.nsn = $1
        LIMIT 1
      `, [row.nsn]);
      
      if (urlResult.rows.length > 0) {
        const url = urlResult.rows[0];
        const groupName = url.fsg_title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
        const subgroupName = url.fsc_title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
        
        console.log(`\n  http://localhost:3000/catalog/${url.fsg}/${groupName}/${url.fsc}/${subgroupName}/${row.nsn}`);
        console.log(`    Data available: Summary: ${row.has_summary} | INC: ${row.has_inc} | Related: ${row.has_related}`);
      }
    }
    
  } catch (error) {
    console.error('Error finding NSNs with data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

findNSNsWithData();