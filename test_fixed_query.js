#!/usr/bin/env node

// Test the fixed optimized query
import { getPartsByNSN } from './src/lib/db.js';

async function testFixedQuery() {
  try {
    console.log('🧪 Testing FIXED optimized query...\n');
    
    const testNSNs = [
      '5830-00-146-6591',
      '5310-01-183-1237', 
      '5850-00-064-6405'
    ];
    
    for (const originalNSN of testNSNs) {
      const normalizedNSN = originalNSN.replace(/-/g, '');
      console.log(`Testing NSN: ${originalNSN} → ${normalizedNSN}`);
      
      const startTime = Date.now();
      const results = await getPartsByNSN(normalizedNSN);
      const queryTime = Date.now() - startTime;
      
      console.log(`  ✅ Fixed query result: ${results.length} rows in ${queryTime}ms`);
      
      if (results.length > 0) {
        console.log(`    Found: NSN=${results[0].nsn}, Company=${results[0].company_name || 'N/A'}`);
      }
      console.log('  ---');
    }
    
  } catch (error) {
    console.error('Error testing fixed query:', error);
  }
}

testFixedQuery();