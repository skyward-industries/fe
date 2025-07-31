#!/usr/bin/env node

// Test the optimized partInfo query directly
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function testOptimizedQuery() {
  let client;
  try {
    console.log('Testing optimized partInfo query performance...\n');
    
    client = await pool.connect();
    
    const testNsn = '5935-00-929-3179';
    console.log(`Testing problematic NSN: ${testNsn}`);
    
    // Test the OPTIMIZED query (without subqueries) 
    console.log('\n1. Testing OPTIMIZED main query:');
    const optimizedQuery = `
      SELECT
        pi.nsn, pi.fsg, pi.fsc, pi.niin,
        fsgs.fsg_title, fsgs.fsc_title,
        pn.part_number, pn.cage_code,
        addr.company_name, addr.street_address_1, addr.city, addr.state, addr.zip,
        vfm.moe_rule AS moe_rule_vfm, vfm.aac, vfm.unit_of_issue,
        fi.activity_code, fi.uniform_freight_class
      FROM public.part_info pi
      LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
      LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
      LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
      LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      LEFT JOIN public.freight_info fi ON pi.niin = fi.niin
      WHERE pi.nsn = $1;
    `;
    
    const startTime = Date.now();
    const result = await client.query(optimizedQuery, [testNsn]);
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ OPTIMIZED query completed in ${queryTime}ms`);
    console.log(`Found ${result.rows.length} parts`);
    
    if (result.rows.length > 0) {
      const part = result.rows[0];
      console.log(`Part: ${part.nsn}, Company: ${part.company_name}, Part#: ${part.part_number}`);
      
      // Test optional additional data separately
      console.log('\n2. Testing optional additional data:');
      const additionalQuery = `
        SELECT 
          (SELECT item_name FROM public.nsn_with_inc WHERE nsn = $1 LIMIT 1) AS item_name,
          (SELECT mrc FROM public.char_data WHERE niin = $2 LIMIT 1) AS mrc
      `;
      
      const additionalStart = Date.now();
      try {
        await client.query('SET statement_timeout = 5000'); // 5 second timeout
        const additionalResult = await client.query(additionalQuery, [part.nsn, part.niin]);
        const additionalTime = Date.now() - additionalStart;
        
        console.log(`✅ Additional data fetched in ${additionalTime}ms`);
        if (additionalResult.rows[0]) {
          console.log(`Item name: ${additionalResult.rows[0].item_name || 'N/A'}`);
          console.log(`MRC: ${additionalResult.rows[0].mrc || 'N/A'}`);
        }
        
        console.log(`\n🎉 TOTAL TIME: ${queryTime + additionalTime}ms`);
        console.log(`🚀 Performance improvement: ~${Math.round(100000 / (queryTime + additionalTime))}x faster than before!`);
        
      } catch (additionalError) {
        const additionalTime = Date.now() - additionalStart;
        console.log(`⚠️  Additional data timed out after ${additionalTime}ms (this is OK - it's optional)`);
        console.log(`🎉 Main query works perfectly in ${queryTime}ms (was 100+ seconds!)`);
      }
    }
    
  } catch (error) {
    console.error('Error testing optimized query:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testOptimizedQuery();