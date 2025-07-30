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

async function testCorrectPadding() {
  const client = await pool.connect();
  
  try {
    const testNSN = '1005-00-000-0061';
    
    console.log(`=== TESTING CORRECT PADDING FOR ${testNSN} ===\n`);
    
    // Test different padding approaches
    console.log('1. Testing various padding approaches:');
    const paddingResult = await client.query(`
      SELECT 
        $1 as original_nsn,
        -- Approach 1: Replace last 4 digits with 6 digits
        CONCAT(SUBSTRING($1, 1, 12), LPAD(SUBSTRING($1, 13), 6, '0')) as method1,
        -- Approach 2: Insert zeros before last segment  
        CONCAT(SUBSTRING($1, 1, 12), '00', SUBSTRING($1, 13)) as method2,
        -- Approach 3: Manual construction
        CONCAT(SUBSTRING($1, 1, 11), '0', SUBSTRING($1, 12)) as method3
    `, [testNSN]);
    
    const result = paddingResult.rows[0];
    console.log(`  Original: ${result.original_nsn}`);
    console.log(`  Method 1: ${result.method1}`);
    console.log(`  Method 2: ${result.method2}`);
    console.log(`  Method 3: ${result.method3}`);
    
    // Test which method finds a match
    console.log('\n2. Testing which method finds a match:');
    
    const methods = [
      { name: 'Method 1', nsn: result.method1 },
      { name: 'Method 2', nsn: result.method2 },
      { name: 'Method 3', nsn: result.method3 }
    ];
    
    for (const method of methods) {
      const matchResult = await client.query(`
        SELECT nsn, inc, item_name
        FROM public.nsn_with_inc
        WHERE nsn = $1
      `, [method.nsn]);
      
      if (matchResult.rows.length > 0) {
        console.log(`  ✅ ${method.name} FOUND MATCH!`);
        matchResult.rows.forEach(row => {
          console.log(`    NSN: ${row.nsn}, INC: ${row.inc}, Item: ${row.item_name}`);
        });
      } else {
        console.log(`  ❌ ${method.name} no match (${method.nsn})`);
      }
    }
    
    // Check what the actual format is
    console.log('\n3. Checking actual NSN format pattern:');
    const patternResult = await client.query(`
      SELECT nsn, inc, item_name
      FROM public.nsn_with_inc
      WHERE nsn LIKE '1005-00-000-00%61'
      LIMIT 5
    `);
    
    if (patternResult.rows.length > 0) {
      console.log('  Found similar NSNs:');
      patternResult.rows.forEach(row => {
        console.log(`    ${row.nsn} -> INC: ${row.inc}, Item: ${row.item_name}`);
      });
    } else {
      console.log('  No similar patterns found');
    }
    
  } catch (error) {
    console.error('Error testing correct padding:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testCorrectPadding();