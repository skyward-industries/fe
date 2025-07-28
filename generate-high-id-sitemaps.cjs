#!/usr/bin/env node

// Script to generate sitemap indexes for high ID ranges (1.5M+)
// Tests higher ranges more aggressively and handles timeouts better

const fs = require('fs');
const https = require('https');
const { performance } = require('perf_hooks');

const MAX_SITEMAPS_PER_INDEX = 20; // 20 sitemaps per index
const TEST_TIMEOUT = 6000; // Shorter timeout for high ranges
const START_RANGE = 1560001; // Start where we left off (after sitemap-index-26)
const TARGET_INDEXES = 30; // Generate 30 more indexes (27-56)
const MAX_RETRIES = 2; // Retry failed ranges

// Test if a sitemap URL is accessible with retries
function testSitemapWithRetry(url, retries = MAX_RETRIES) {
  return new Promise(async (resolve) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await testSitemap(url);
      
      if (result.working || result.error !== 'timeout') {
        // If it works or fails with non-timeout error, return result
        return resolve(result);
      }
      
      if (attempt < retries) {
        console.log(`  Retry ${attempt}/${retries - 1} for ${url.split('/').slice(-1)[0]}`);
        // Small delay before retry
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    // All retries failed
    resolve({ url, working: false, error: 'timeout_after_retries', duration: TEST_TIMEOUT });
  });
}

function testSitemap(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const req = https.get(url, { timeout: TEST_TIMEOUT }, (res) => {
      const duration = performance.now() - startTime;
      
      if (res.statusCode === 200) {
        let hasContent = false;
        let urlCount = 0;
        
        res.on('data', (chunk) => {
          const chunkStr = chunk.toString();
          if (chunkStr.includes('<url>')) {
            hasContent = true;
            const matches = chunkStr.match(/<url>/g);
            if (matches) urlCount += matches.length;
          }
        });
        
        res.on('end', () => {
          resolve({ 
            url, 
            working: true, 
            hasContent, 
            urlCount,
            duration: Math.round(duration) 
          });
        });
      } else {
        resolve({ 
          url, 
          working: false, 
          statusCode: res.statusCode, 
          duration: Math.round(duration) 
        });
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        url, 
        working: false, 
        error: 'timeout', 
        duration: TEST_TIMEOUT 
      });
    });
    
    req.on('error', (err) => {
      resolve({ 
        url, 
        working: false, 
        error: err.message, 
        duration: Math.round(performance.now() - startTime) 
      });
    });
  });
}

async function generateHighIdSitemaps() {
  console.log(`Generating sitemap indexes for high ID ranges...`);
  console.log(`Testing ID ranges starting from ${START_RANGE.toLocaleString()}`);
  console.log(`Target: ${TARGET_INDEXES} indexes with ${MAX_SITEMAPS_PER_INDEX} sitemaps each\n`);
  
  const ranges = [];
  const workingRanges = [];
  const failingRanges = [];
  
  // Generate ranges starting from where we left off
  let currentStart = START_RANGE;
  let totalRangesNeeded = TARGET_INDEXES * MAX_SITEMAPS_PER_INDEX; // 600 ranges needed
  
  console.log(`Need ${totalRangesNeeded} working ranges to create ${TARGET_INDEXES} indexes`);
  
  // We'll test more ranges than needed to account for failures in high ID ranges
  const maxRangesToTest = Math.min(totalRangesNeeded * 4, 2000); // Test up to 2000 ranges max
  
  for (let i = 0; i < maxRangesToTest; i++) {
    const start = currentStart + (i * 3000);
    const end = start + 2999;
    ranges.push({ start, end });
  }
  
  console.log(`Testing up to ${ranges.length} ranges in batches...`);
  console.log(`Using ${TEST_TIMEOUT/1000}s timeout with ${MAX_RETRIES} retries for failed ranges\n`);
  
  // Test in smaller batches for high ID ranges
  const batchSize = 15;
  let batchNum = 1;
  
  for (let i = 0; i < ranges.length && workingRanges.length < totalRangesNeeded; i += batchSize) {
    const batch = ranges.slice(i, i + batchSize);
    const batchStart = batch[0].start;
    const batchEnd = batch[batch.length - 1].end;
    
    console.log(`Batch ${batchNum}: Testing ${batch.length} ranges (${batchStart.toLocaleString()}-${batchEnd.toLocaleString()})`);
    
    // Test batch with retries
    const promises = batch.map(range => 
      testSitemapWithRetry(`https://skywardparts.com/sitemap/${range.start}/${range.end}.xml`)
    );
    
    const results = await Promise.all(promises);
    
    let batchWorking = 0;
    let batchFailing = 0;
    
    results.forEach((result, idx) => {
      const range = batch[idx];
      if (result.working) {
        workingRanges.push(range);
        batchWorking++;
        console.log(`  ✅ ${range.start}-${range.end}: ${result.duration}ms (${result.urlCount || 0} URLs)`);
      } else {
        failingRanges.push({ ...range, error: result.error || result.statusCode });
        batchFailing++;
        console.log(`  ❌ ${range.start}-${range.end}: ${result.error || result.statusCode} (${result.duration}ms)`);
      }
    });
    
    console.log(`  Batch ${batchNum} results: ✅ ${batchWorking} / ❌ ${batchFailing} (${(batchWorking/batch.length*100).toFixed(1)}% success)`);
    console.log(`  Progress: ${workingRanges.length}/${totalRangesNeeded} working ranges found\n`);
    
    batchNum++;
    
    // Stop if we have enough working ranges
    if (workingRanges.length >= totalRangesNeeded) {
      console.log(`✅ Found enough working ranges!`);
      break;
    }
    
    // Add delay between batches for high ID ranges
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\nFinal Test Results:`);
  console.log(`Working ranges found: ${workingRanges.length}`);
  console.log(`Failing ranges: ${failingRanges.length}`);
  console.log(`Success rate: ${(workingRanges.length/(workingRanges.length + failingRanges.length)*100).toFixed(1)}%`);
  
  if (workingRanges.length < totalRangesNeeded) {
    console.log(`⚠️ Only found ${workingRanges.length} working ranges, need ${totalRangesNeeded}`);
    console.log(`Will create ${Math.floor(workingRanges.length / MAX_SITEMAPS_PER_INDEX)} indexes instead`);
  }
  
  // Create sitemap indexes from working ranges
  const sitemapIndexes = [];
  const startIndexNum = 27; // Start numbering from 27
  
  for (let i = 0; i < workingRanges.length; i += MAX_SITEMAPS_PER_INDEX) {
    const chunk = workingRanges.slice(i, i + MAX_SITEMAPS_PER_INDEX);
    const indexNum = startIndexNum + Math.floor(i / MAX_SITEMAPS_PER_INDEX);
    
    const sitemapEntries = chunk.map(range => `  <sitemap>
    <loc>https://skywardparts.com/sitemap/${range.start}/${range.end}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n');
    
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
    
    const filename = `public/sitemap-index-${indexNum}.xml`;
    fs.writeFileSync(filename, sitemapIndexXml);
    
    sitemapIndexes.push({
      filename,
      indexNum,
      ranges: chunk.length,
      startRange: chunk[0].start,
      endRange: chunk[chunk.length - 1].end
    });
    
    console.log(`Created ${filename} with ${chunk.length} working sitemaps (${chunk[0].start.toLocaleString()}-${chunk[chunk.length - 1].end.toLocaleString()})`);
  }
  
  // Analyze failure patterns
  const errorTypes = {};
  failingRanges.forEach(range => {
    const error = range.error || 'unknown';
    errorTypes[error] = (errorTypes[error] || 0) + 1;
  });
  
  // Update summary
  const summary = {
    created: new Date().toISOString(),
    startRange: START_RANGE,
    totalWorkingRanges: workingRanges.length,
    totalFailingRanges: failingRanges.length,
    successRate: `${(workingRanges.length/(workingRanges.length + failingRanges.length)*100).toFixed(1)}%`,
    sitemapIndexesCreated: sitemapIndexes.length,
    indexRange: `${startIndexNum}-${startIndexNum + sitemapIndexes.length - 1}`,
    maxSitemapsPerIndex: MAX_SITEMAPS_PER_INDEX,
    testSettings: {
      timeout: TEST_TIMEOUT,
      retries: MAX_RETRIES,
      batchSize: 15
    },
    errorAnalysis: errorTypes,
    indexes: sitemapIndexes,
    failingRangesSample: failingRanges.slice(0, 20)
  };
  
  fs.writeFileSync('sitemap-high-id-summary.json', JSON.stringify(summary, null, 2));
  
  console.log(`\n✅ Created ${sitemapIndexes.length} sitemap indexes for high ID ranges:`);
  sitemapIndexes.forEach((index) => {
    console.log(`  - sitemap-index-${index.indexNum}.xml: ${index.ranges} sitemaps (${index.startRange.toLocaleString()}-${index.endRange.toLocaleString()})`);
  });
  
  console.log(`\n📋 Summary:`);
  console.log(`  - Indexes created: sitemap-index-${startIndexNum}.xml through sitemap-index-${startIndexNum + sitemapIndexes.length - 1}.xml`);
  console.log(`  - Working ranges: ${workingRanges.length}`);
  console.log(`  - Failing ranges: ${failingRanges.length}`);
  console.log(`  - Overall success rate: ${summary.successRate}`);
  console.log(`  - Summary saved: sitemap-high-id-summary.json`);
  
  console.log(`\n📊 Error Analysis:`);
  Object.entries(errorTypes).forEach(([error, count]) => {
    console.log(`  - ${error}: ${count} ranges`);
  });
  
  console.log(`\n🚀 Next steps:`);
  console.log(`  1. Test the new indexes: node test-individual-sitemap.cjs sitemap-index-27.xml`);
  console.log(`  2. Deploy the changes to make new sitemaps accessible`);
  console.log(`  3. Submit working indexes to GSC gradually`);
  
  if (summary.successRate < 50) {
    console.log(`\n⚠️ Low success rate detected. Consider:`);
    console.log(`  - Running database optimizations: psql -f optimize_2_8m_range.sql`);
    console.log(`  - Checking if higher ID ranges have actual data`);
    console.log(`  - Adjusting VERY_HIGH_ID_THRESHOLD in the API`);
  }
}

generateHighIdSitemaps().catch(console.error);