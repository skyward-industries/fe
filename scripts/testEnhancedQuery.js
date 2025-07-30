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

async function testEnhancedQuery() {
  const client = await pool.connect();
  
  try {
    // Test with an NSN that should have INC data
    const testNSN = '1005-00-000-0061'; // This has a summary
    
    console.log(`=== TESTING ENHANCED QUERY FOR ${testNSN} ===\n`);
    
    // Import and test the enhanced function
    const { getEnhancedPartsByNSN } = await import('../src/lib/dbEnhanced.js');
    
    const result = await getEnhancedPartsByNSN(testNSN);
    
    console.log(`Found ${result.length} enhanced records\n`);
    
    if (result.length > 0) {
      const part = result[0];
      
      console.log('=== ENHANCED DATA RESULTS ===');
      console.log(`NSN: ${part.nsn}`);
      console.log(`Item Name: ${part.item_name || 'N/A'}`);
      console.log(`INC: ${part.inc || 'N/A'}`);
      console.log(`AI Summary: ${part.ai_summary ? '✅ Present' : '❌ Missing'}`);
      console.log(`Characteristics: ${part.characteristics?.length || 0} items`);
      console.log(`Related Parts: ${part.related_parts?.length || 0} items`);
      console.log(`INC Details: ${part.inc_details ? '✅ Present' : '❌ Missing'}`);
      console.log(`Hazmat Info: ${part.hazmat_info?.length || 0} items`);
      
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

testEnhancedQuery();