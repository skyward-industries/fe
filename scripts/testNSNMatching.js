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

async function testNSNMatching() {
  const client = await pool.connect();
  
  try {
    const testNSN = '1005-00-000-0061';
    
    console.log(`=== TESTING NSN MATCHING FOR ${testNSN} ===\n`);
    
    // Test the NSN transformation
    console.log('1. Testing NSN transformation logic:');
    const transformResult = await client.query(`
      SELECT 
        $1 as original_nsn,
        CONCAT(SUBSTRING($1, 1, 12), '0', SUBSTRING($1, 13)) as padded_nsn
    `, [testNSN]);
    
    const original = transformResult.rows[0].original_nsn;
    const padded = transformResult.rows[0].padded_nsn;
    
    console.log(`  Original: ${original}`);
    console.log(`  Padded:   ${padded}`);
    
    // Test if the padded version exists in nsn_with_inc
    console.log('\n2. Testing if padded NSN exists in nsn_with_inc:');
    const matchResult = await client.query(`
      SELECT nsn, inc, item_name
      FROM public.nsn_with_inc
      WHERE nsn = $1
    `, [padded]);
    
    if (matchResult.rows.length > 0) {
      console.log(`  ✅ MATCH FOUND!`);
      matchResult.rows.forEach(row => {
        console.log(`    NSN: ${row.nsn}, INC: ${row.inc}, Item: ${row.item_name}`);
      });
    } else {
      console.log(`  ❌ No match found for padded NSN`);
    }
    
    // Test the full join query
    console.log('\n3. Testing the enhanced join query:');
    const joinResult = await client.query(`
      SELECT 
        pi.nsn as part_info_nsn,
        ni.nsn as inc_nsn,
        ni.inc,
        ni.item_name
      FROM public.part_info pi
      LEFT JOIN public.nsn_with_inc ni ON (
        pi.nsn = ni.nsn 
        OR CONCAT(SUBSTRING(pi.nsn, 1, 12), '0', SUBSTRING(pi.nsn, 13)) = ni.nsn
        OR pi.nsn = CONCAT(SUBSTRING(ni.nsn, 1, 12), SUBSTRING(ni.nsn, 14))
      )
      WHERE pi.nsn = $1
      LIMIT 5
    `, [testNSN]);
    
    if (joinResult.rows.length > 0) {
      console.log(`  Found ${joinResult.rows.length} join results:`);
      joinResult.rows.forEach(row => {
        console.log(`    Part Info NSN: ${row.part_info_nsn}`);
        console.log(`    INC NSN: ${row.inc_nsn || 'NULL'}`);
        console.log(`    INC: ${row.inc || 'NULL'}`);
        console.log(`    Item: ${row.item_name || 'NULL'}`);
        console.log('    ---');
      });
    } else {
      console.log(`  ❌ No join results found`);
    }
    
  } catch (error) {
    console.error('Error testing NSN matching:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testNSNMatching();