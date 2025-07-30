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

async function debugNSNFormats() {
  const client = await pool.connect();
  
  try {
    console.log('=== DEBUGGING NSN FORMATS ===\n');
    
    // Check NSN formats in part_info
    console.log('1. Sample NSNs from part_info:');
    const partInfoNSNs = await client.query(`
      SELECT nsn, LENGTH(nsn) as length
      FROM public.part_info
      WHERE nsn LIKE '1005%'
      ORDER BY nsn
      LIMIT 10
    `);
    
    partInfoNSNs.rows.forEach(row => {
      console.log(`  part_info: ${row.nsn} (length: ${row.length})`);
    });
    
    // Check NSN formats in nsn_with_inc
    console.log('\n2. Sample NSNs from nsn_with_inc:');
    const incNSNs = await client.query(`
      SELECT nsn, LENGTH(nsn) as length, inc, item_name
      FROM public.nsn_with_inc
      WHERE nsn LIKE '1005%'
      ORDER BY nsn
      LIMIT 10
    `);
    
    incNSNs.rows.forEach(row => {
      console.log(`  nsn_with_inc: ${row.nsn} (length: ${row.length}) -> INC: ${row.inc}, Item: ${row.item_name}`);
    });
    
    // Look for any matching patterns
    console.log('\n3. Looking for NSN pattern matches:');
    const testNSN = '1005-00-000-0061';
    
    // Try various transformations
    const variations = [
      testNSN,
      testNSN.replace(/-/g, ''),
      testNSN.replace(/-/g, '').padStart(13, '0'),
      testNSN.replace(/-/g, '').padEnd(13, '0'),
      '1005000000061',
      '105000000061',
      testNSN.substring(0, testNSN.length - 1), // Remove last digit
      testNSN + '0' // Add zero
    ];
    
    for (const variation of variations) {
      const matchResult = await client.query(`
        SELECT nsn, inc, item_name
        FROM public.nsn_with_inc
        WHERE nsn = $1
        LIMIT 1
      `, [variation]);
      
      if (matchResult.rows.length > 0) {
        console.log(`  ✅ Match found for variation "${variation}"`);
        console.log(`    -> ${matchResult.rows[0].nsn}, INC: ${matchResult.rows[0].inc}, Item: ${matchResult.rows[0].item_name}`);
      } else {
        console.log(`  ❌ No match for variation "${variation}"`);
      }
    }
    
    // Check if the test NSN exists in part_info but with what format in nsn_with_inc
    console.log('\n4. Checking NSN similarity search:');
    const similarityResult = await client.query(`
      SELECT nsn, inc, item_name,
        SIMILARITY(nsn, $1) as similarity_score
      FROM public.nsn_with_inc
      WHERE nsn % $1  -- Uses trigram similarity
        OR nsn LIKE '%00000061%'
        OR nsn LIKE '%1005%'
      ORDER BY similarity_score DESC
      LIMIT 5
    `, [testNSN]);
    
    if (similarityResult.rows.length > 0) {
      console.log('Similar NSNs found:');
      similarityResult.rows.forEach(row => {
        console.log(`  ${row.nsn} (similarity: ${row.similarity_score}) -> INC: ${row.inc}, Item: ${row.item_name}`);
      });
    } else {
      console.log('No similar NSNs found using trigram search');
    }
    
  } catch (error) {
    console.error('Error debugging NSN formats:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

debugNSNFormats();