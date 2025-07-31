#!/usr/bin/env node

// Analyze partInfo query performance for specific NSNs
import { Pool } from 'pg';

const pool = new Pool({
  host: 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'skyward',
  user: 'postgres',
  password: 'Skyward_db_pw1234!',
  ssl: { rejectUnauthorized: false },
});

async function analyzePartInfoPerformance() {
  let client;
  try {
    console.log('Analyzing partInfo query performance...\n');
    
    client = await pool.connect();
    
    // Test the problematic NSN from the logs
    const testNsn = '5935-00-929-3179';
    console.log(`Testing problematic NSN: ${testNsn}`);
    
    // The actual query from db.js
    const partInfoQuery = `
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT
        pi.nsn, pi.fsg, pi.fsc,
        fsgs.fsg_title, fsgs.fsc_title,
        pn.part_number, pn.cage_code,
        addr.company_name, addr.company_name_2, addr.company_name_3, addr.company_name_4, addr.company_name_5,
        addr.street_address_1, addr.street_address_2, addr.po_box, addr.city, addr.state, addr.zip, addr.country,
        addr.date_est, addr.last_update, addr.former_name_1, addr.former_name_2, addr.former_name_3, addr.former_name_4, addr.frn_dom,
        vfm.moe_rule AS moe_rule_vfm, vfm.aac, vfm.sos, vfm.sosm, vfm.unit_of_issue, vfm.controlled_inventory_code,
        vfm.shelf_life_code, vfm.replenishment_code, vfm.management_control_code, vfm.use_status_code,
        vfm.effective_date AS row_effective_date, vfm.row_observation_date AS row_obs_date_fm,
        fi.activity_code, fi.nmfc_number, fi.nmfc_subcode, fi.uniform_freight_class, fi.ltl_class,
        fi.wcc, fi.tcc, fi.shc, fi.adc, fi.acc, fi.nmf_desc AS nmfc_description,
        (SELECT item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS item_name,
        (SELECT end_item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS end_item_name,
        (SELECT mrc FROM public.char_data WHERE niin = pi.niin LIMIT 1) AS mrc,
        (SELECT requirements_statement FROM public.char_data WHERE niin = pi.niin LIMIT 1) AS requirements_statement,
        (SELECT clear_text_reply FROM public.char_data WHERE niin = pi.niin LIMIT 1) AS clear_text_reply
      FROM public.part_info pi
      LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
      LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
      LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
      LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      LEFT JOIN public.freight_info fi ON pi.niin = fi.niin
      WHERE pi.nsn = $1;
    `;
    
    console.log('Running EXPLAIN ANALYZE on partInfo query...');
    const startTime = Date.now();
    
    try {
      const result = await client.query(partInfoQuery, [testNsn]);
      const queryTime = Date.now() - startTime;
      
      console.log(`\nQuery completed in ${queryTime}ms`);
      console.log('\nExecution plan:');
      result.rows.forEach(row => {
        console.log(`  ${row['QUERY PLAN']}`);
      });
    } catch (error) {
      const queryTime = Date.now() - startTime;
      console.error(`\n❌ Query failed after ${queryTime}ms: ${error.message}`);
    }
    
    // Check indexes on key join columns
    console.log('\n' + '='.repeat(50));
    console.log('Checking indexes on join columns...');
    
    const indexCheck = `
      SELECT 
        t.tablename,
        i.indexname,
        i.indexdef
      FROM pg_indexes i
      JOIN pg_tables t ON t.tablename = i.tablename
      WHERE t.tablename IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'v_flis_management', 'wp_fsgs_new', 'freight_info', 'char_data', 'nsn_with_inc')
      AND (
        i.indexdef LIKE '%nsn%' OR 
        i.indexdef LIKE '%niin%' OR 
        i.indexdef LIKE '%cage_code%' OR
        i.indexdef LIKE '%fsg%' OR
        i.indexdef LIKE '%fsc%'
      )
      ORDER BY t.tablename, i.indexname;
    `;
    
    const indexResult = await client.query(indexCheck);
    console.log('\nRelevant indexes:');
    indexResult.rows.forEach(row => {
      console.log(`${row.tablename}.${row.indexname}: ${row.indexdef}`);
    });
    
    // Test individual subqueries
    console.log('\n' + '='.repeat(50));
    console.log('Testing individual subqueries...');
    
    // First get the niin for this NSN
    const niinResult = await client.query('SELECT niin FROM part_info WHERE nsn = $1', [testNsn]);
    if (niinResult.rows.length > 0) {
      const niin = niinResult.rows[0].niin;
      console.log(`Found NIIN: ${niin}`);
      
      // Test the char_data subqueries
      const subqueries = [
        `SELECT mrc FROM public.char_data WHERE niin = '${niin}' LIMIT 1`,
        `SELECT requirements_statement FROM public.char_data WHERE niin = '${niin}' LIMIT 1`,
        `SELECT clear_text_reply FROM public.char_data WHERE niin = '${niin}' LIMIT 1`,
        `SELECT item_name FROM public.nsn_with_inc WHERE nsn = '${testNsn}' LIMIT 1`,
        `SELECT end_item_name FROM public.nsn_with_inc WHERE nsn = '${testNsn}' LIMIT 1`
      ];
      
      for (const subquery of subqueries) {
        try {
          const subStart = Date.now();
          await client.query(subquery);
          const subTime = Date.now() - subStart;
          console.log(`✅ Subquery took ${subTime}ms: ${subquery.substring(0, 50)}...`);
        } catch (error) {
          console.log(`❌ Subquery failed: ${subquery.substring(0, 50)}... - ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error analyzing partInfo performance:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

analyzePartInfoPerformance();