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

async function debugIncJoining() {
  const client = await pool.connect();
  
  try {
    const testNSN = '1005-00-056-2252'; // From your screenshot
    
    console.log('=== DEBUGGING INC JOINING ===\n');
    console.log(`Testing with NSN: ${testNSN}\n`);
    
    // 1. Check if NSN has INC data
    console.log('1. Checking nsn_with_inc data:');
    const nsnIncResult = await client.query(`
      SELECT nsn, inc, item_name, end_item_name
      FROM public.nsn_with_inc 
      WHERE nsn = $1
    `, [testNSN]);
    
    if (nsnIncResult.rows.length > 0) {
      console.log('Found INC data:');
      nsnIncResult.rows.forEach(row => {
        console.log(`  NSN: ${row.nsn}, INC: ${row.inc}, Item: ${row.item_name}`);
      });
    } else {
      console.log('❌ No INC data found for this NSN');
    }
    
    // 2. Check if INC exists in h6 table
    if (nsnIncResult.rows.length > 0) {
      const incValue = nsnIncResult.rows[0].inc;
      console.log(`\n2. Checking v_h6_name_inc for INC: ${incValue}`);
      
      const h6Result = await client.query(`
        SELECT inc, inc_status, fiig, app_key, concept_no, definition
        FROM public.v_h6_name_inc 
        WHERE inc = $1
      `, [incValue?.toString()]);
      
      if (h6Result.rows.length > 0) {
        console.log('✅ Found H6 data:');
        h6Result.rows.forEach(row => {
          console.log(`  INC: ${row.inc}, Status: ${row.inc_status}, FIIG: ${row.fiig}`);
          console.log(`  Definition: ${row.definition?.substring(0, 100)}...`);
        });
      } else {
        console.log('❌ No H6 data found for this INC');
        
        // Check what INC values exist in H6
        console.log('\n3. Sample INC values in v_h6_name_inc:');
        const sampleH6 = await client.query(`
          SELECT DISTINCT inc 
          FROM public.v_h6_name_inc 
          ORDER BY inc 
          LIMIT 10
        `);
        
        console.log('Sample INC values:');
        sampleH6.rows.forEach(row => {
          console.log(`  - ${row.inc} (type: ${typeof row.inc})`);
        });
        
        console.log(`\nLooking for INC: ${incValue} (type: ${typeof incValue})`);
      }
    }
    
    // 3. Check related NSNs
    console.log(`\n4. Checking related NSNs for ${testNSN}:`);
    const relatedResult = await client.query(`
      SELECT nsn, related_nsn
      FROM public.related_nsns 
      WHERE nsn = $1
    `, [testNSN]);
    
    if (relatedResult.rows.length > 0) {
      console.log('✅ Found related NSNs:');
      relatedResult.rows.forEach(row => {
        console.log(`  ${row.nsn} -> ${row.related_nsn}`);
      });
    } else {
      console.log('❌ No related NSNs found');
    }
    
    // 4. Test the full enhanced query
    console.log(`\n5. Testing full enhanced query:`);
    const enhancedResult = await client.query(`
      WITH part_base AS (
        SELECT pi.nsn, pi.niin, ni.inc
        FROM public.part_info pi
        LEFT JOIN public.nsn_with_inc ni ON pi.nsn = ni.nsn
        WHERE pi.nsn = $1
        LIMIT 1
      )
      SELECT 
        pb.nsn,
        pb.inc,
        (
          SELECT row_to_json(sub.*)
          FROM (
            SELECT 
              h6.inc,
              h6.inc_status,
              h6.fiig,
              h6.app_key,
              h6.concept_no,
              h6.definition as inc_definition
            FROM public.v_h6_name_inc h6
            WHERE h6.inc = pb.inc::text
            LIMIT 1
          ) sub
        ) as inc_details
      FROM part_base pb
    `, [testNSN]);
    
    console.log('Enhanced query result:');
    console.log(JSON.stringify(enhancedResult.rows[0], null, 2));
    
  } catch (error) {
    console.error('Error debugging INC joining:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

debugIncJoining();