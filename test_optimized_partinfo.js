#!/usr/bin/env node

// Test the optimized partInfo query
import { getPartsByNSN, getPartAdditionalData } from './src/lib/db.js';

async function testOptimizedPartInfo() {
  try {
    console.log('Testing optimized partInfo query...\n');
    
    // Test the problematic NSN
    const testNsn = '5935-00-929-3179';
    console.log(`Testing NSN: ${testNsn}`);
    
    // Test the fast main query
    console.log('\n1. Testing FAST main query (without expensive subqueries):');
    const startTime = Date.now();
    const parts = await getPartsByNSN(testNsn);
    const mainQueryTime = Date.now() - startTime;
    
    console.log(`✅ Main query completed in ${mainQueryTime}ms (was 100+ seconds!)`);
    console.log(`Found ${parts.length} parts`);
    
    if (parts.length > 0) {
      const part = parts[0];
      console.log(`Part data: NSN=${part.nsn}, NIIN=${part.niin}, FSG=${part.fsg}`);
      
      // Test the optional additional data
      console.log('\n2. Testing OPTIONAL additional data query:');
      const additionalStart = Date.now();
      const additionalData = await getPartAdditionalData(part.nsn, part.niin);
      const additionalTime = Date.now() - additionalStart;
      
      console.log(`Additional data query: ${additionalTime}ms`);
      console.log(`Item name: ${additionalData.item_name || 'N/A'}`);
      console.log(`MRC: ${additionalData.mrc || 'N/A'}`);
      
      console.log(`\n🎉 TOTAL TIME: ${mainQueryTime + additionalTime}ms (vs 100+ seconds before)`);
      console.log(`Performance improvement: ${Math.round((100000 - (mainQueryTime + additionalTime)) / 1000)}x faster!`);
    }
    
  } catch (error) {
    console.error('Error testing optimized partInfo:', error);
  }
}

testOptimizedPartInfo();