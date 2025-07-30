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

async function testEnhancedQueryDirect() {
  const client = await pool.connect();
  
  try {
    const testNSN = '1005-00-000-0061'; // Has AI summary, let's see if it gets INC data
    
    console.log(`=== TESTING ENHANCED QUERY FOR ${testNSN} ===\n`);
    
    // Test the enhanced query directly
    const query = `
      WITH part_base AS (
        SELECT
          pi.nsn, pi.fsg, pi.fsc, pi.niin,
          fsgs.fsg_title, fsgs.fsc_title,
          pn.part_number, pn.cage_code,
          addr.company_name,
          vfm.unit_of_issue, vfm.shelf_life_code, vfm.controlled_inventory_code,
          ni.inc, ni.item_name, ni.end_item_name,
          aid.ai_summary, aid.meta_description
        FROM public.part_info pi
        LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
        LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
        LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
        LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
        LEFT JOIN public.nsn_with_inc ni ON (
          pi.nsn = ni.nsn 
          OR pi.nsn = REPLACE(ni.nsn, '-', '')
          OR REPLACE(pi.nsn, '-', '') = ni.nsn
          OR pi.nsn = LPAD(ni.nsn, LENGTH(pi.nsn), '0')
          OR LPAD(pi.nsn, LENGTH(ni.nsn), '0') = ni.nsn
        )
        LEFT JOIN public.product_ai_descriptions aid ON pi.nsn = aid.nsn
        WHERE pi.nsn = $1
      ),
      -- Get INC details if available
      inc_details AS (
        SELECT DISTINCT
          h6.inc,
          h6.inc_status,
          h6.fiig,
          h6.app_key,
          h6.concept_no,
          h6.definition as inc_definition
        FROM public.v_h6_name_inc h6
        WHERE h6.inc IN (
          SELECT ni.inc::text 
          FROM public.nsn_with_inc ni 
          WHERE ni.nsn = $1 
             OR ni.nsn = REPLACE($1, '-', '')
             OR ni.nsn = '0' || $1
             OR ni.nsn = $1 || '0'
          AND ni.inc IS NOT NULL
        )
      )
      SELECT 
        pb.*,
        (
          SELECT row_to_json(id.*)
          FROM inc_details id
          LIMIT 1
        ) as inc_details
      FROM part_base pb;
    `;
    
    const result = await client.query(query, [testNSN]);
    
    console.log(`Found ${result.rows.length} records\n`);
    
    if (result.rows.length > 0) {
      const part = result.rows[0];
      
      console.log('=== ENHANCED DATA RESULTS ===');
      console.log(`NSN: ${part.nsn}`);
      console.log(`Item Name: ${part.item_name || 'N/A'}`);
      console.log(`INC: ${part.inc || 'N/A'}`);
      console.log(`AI Summary: ${part.ai_summary ? '✅ Present (' + part.ai_summary.length + ' chars)' : '❌ Missing'}`);
      console.log(`INC Details: ${part.inc_details ? '✅ Present' : '❌ Missing'}`);
      
      if (part.inc_details) {
        console.log('\n--- INC DETAILS ---');
        console.log(`INC: ${part.inc_details.inc}`);
        console.log(`Status: ${part.inc_details.inc_status}`);
        console.log(`FIIG: ${part.inc_details.fiig}`);
        console.log(`Definition: ${part.inc_details.inc_definition?.substring(0, 200)}...`);
      }
      
      if (part.ai_summary) {
        console.log('\n--- AI SUMMARY PREVIEW ---');
        console.log(part.ai_summary.substring(0, 200) + '...');
      }
      
      // Test direct NSN lookup in nsn_with_inc
      console.log('\n--- NSN FORMAT MATCHING TEST ---');
      const nsnTest = await client.query(`
        SELECT nsn, inc, item_name
        FROM public.nsn_with_inc
        WHERE nsn = $1 
           OR nsn = REPLACE($1, '-', '')
           OR nsn = '0' || $1
           OR nsn = $1 || '0'
           OR REPLACE(nsn, '-', '') = REPLACE($1, '-', '')
        LIMIT 5
      `, [testNSN]);
      
      console.log('NSN matching attempts:');
      nsnTest.rows.forEach(row => {
        console.log(`  Found: ${row.nsn} -> INC: ${row.inc}, Item: ${row.item_name}`);
      });
      
      // Generate a test URL
      const groupName = part.fsg_title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
      const subgroupName = part.fsc_title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
      
      console.log('\n--- TEST URL ---');
      console.log(`http://localhost:3000/catalog/${part.fsg}/${groupName}/${part.fsc}/${subgroupName}/${part.nsn}`);
    }
    
  } catch (error) {
    console.error('Error testing enhanced query:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testEnhancedQueryDirect();