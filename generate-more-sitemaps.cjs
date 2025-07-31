#!/usr/bin/env node

// Script to generate sitemap indexes 6-25 by testing higher ID ranges

const fs = require('fs');
const https = require('https');
const { performance } = require('perf_hooks');

const MAX_SITEMAPS_PER_INDEX = 20; // 20 sitemaps per index
const TEST_TIMEOUT = 8000; // 8 seconds to test each sitemap
const START_RANGE = 300001; // Start where we left off (after sitemap-index-5)
const TARGET_INDEXES = 2000; // Generate indexes 6-25 (20 more indexes)

// Test if a sitemap URL is accessible
function testSitemap(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const req = https.get(url, { timeout: TEST_TIMEOUT }, (res) => {
      const duration = performance.now() - startTime;
      
      if (res.statusCode === 200) {
        let hasContent = false;
        res.on('data', (chunk) => {
          if (chunk.toString().includes('<url>')) {
            hasContent = true;
          }
        });
        
        res.on('end', () => {
          resolve({ url, working: true, hasContent, duration: Math.round(duration) });
        });
      } else {
        resolve({ url, working: false, statusCode: res.statusCode, duration: Math.round(duration) });
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, working: false, error: 'timeout', duration: TEST_TIMEOUT });
    });
    
    req.on('error', (err) => {
      resolve({ url, working: false, error: err.message, duration: Math.round(performance.now() - startTime) });
    });
  });
}

async function generateMoreSitemaps() {
  console.log(`Generating sitemap indexes 6-25...`);
  console.log(`Testing ID ranges starting from ${START_RANGE.toLocaleString()}\n`);
  
  const ranges = [];
  const workingRanges = [];
  const failingRanges = [];
  
  // Generate ranges starting from where we left off
  let currentStart = START_RANGE;
  let totalRangesNeeded = TARGET_INDEXES * MAX_SITEMAPS_PER_INDEX; // 400 ranges needed
  
  console.log(`Need ${totalRangesNeeded} working ranges to create ${TARGET_INDEXES} indexes`);
  
  // We'll test more ranges than needed to account for failures
  const maxRangesToTest = totalRangesNeeded * 3; // Test up to 1200 ranges
  
  for (let i = 0; i < maxRangesToTest && workingRanges.length < totalRangesNeeded; i++) {
    const start = currentStart + (i * 3000);
    const end = start + 2999;
    ranges.push({ start, end });
  }
  
  console.log(`Testing up to ${ranges.length} ranges in batches...`);
  
  // Test in batches of 20 for faster processing
  const batchSize = 20;
  
  for (let i = 0; i < ranges.length && workingRanges.length < totalRangesNeeded; i += batchSize) {
    const batch = ranges.slice(i, i + batchSize);
    const promises = batch.map(range => 
      testSitemap(`https://skywardparts.com/sitemap/${range.start}/${range.end}.xml`)
    );
    
    console.log(`Testing batch ${Math.floor(i/batchSize) + 1}: ranges ${batch[0].start}-${batch[batch.length-1].end}`);
    
    const results = await Promise.all(promises);
    
    results.forEach((result, idx) => {
      const range = batch[idx];
      if (result.working) {
        workingRanges.push(range);
        console.log(`✅ ${range.start}-${range.end}: ${result.duration}ms ${result.hasContent ? '(has URLs)' : '(empty)'}`);
      } else {
        failingRanges.push(range);
        console.log(`❌ ${range.start}-${range.end}: ${result.error || result.statusCode} (${result.duration}ms)`);
      }
    });
    
    console.log(`Progress: ${workingRanges.length}/${totalRangesNeeded} working ranges found`);
    
    // Stop if we have enough working ranges
    if (workingRanges.length >= totalRangesNeeded) {
      console.log(`✅ Found enough working ranges!`);
      break;
    }
    
    // Add a small delay between batches to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nTest Results:`);
  console.log(`Working ranges found: ${workingRanges.length}`);
  console.log(`Failing ranges: ${failingRanges.length}`);
  
  if (workingRanges.length < totalRangesNeeded) {
    console.log(`⚠️ Only found ${workingRanges.length} working ranges, need ${totalRangesNeeded}`);
    console.log(`Will create ${Math.floor(workingRanges.length / MAX_SITEMAPS_PER_INDEX)} indexes instead`);
  }
  
  // Create sitemap indexes from working ranges
  const sitemapIndexes = [];
  const startIndexNum = 6; // Start numbering from 6
  
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
    
    console.log(`Created ${filename} with ${chunk.length} working sitemaps (${chunk[0].start}-${chunk[chunk.length - 1].end})`);
  }
  
  // Update summary
  const summary = {
    created: new Date().toISOString(),
    startRange: START_RANGE,
    totalWorkingRanges: workingRanges.length,
    totalFailingRanges: failingRanges.length,
    sitemapIndexesCreated: sitemapIndexes.length,
    indexRange: `${startIndexNum}-${startIndexNum + sitemapIndexes.length - 1}`,
    maxSitemapsPerIndex: MAX_SITEMAPS_PER_INDEX,
    indexes: sitemapIndexes,
    workingRanges: workingRanges.slice(0, 50), // First 50 working ranges
    failingRanges: failingRanges.slice(0, 50) // First 50 failing ranges
  };
  
  fs.writeFileSync('sitemap-extended-summary.json', JSON.stringify(summary, null, 2));
  
  console.log(`\n✅ Created ${sitemapIndexes.length} additional sitemap indexes:`);
  sitemapIndexes.forEach((index) => {
    console.log(`  - sitemap-index-${index.indexNum}.xml: ${index.ranges} sitemaps (${index.startRange}-${index.endRange})`);
  });
  
  console.log(`\n📋 Summary:`);
  console.log(`  - Indexes created: sitemap-index-${startIndexNum}.xml through sitemap-index-${startIndexNum + sitemapIndexes.length - 1}.xml`);
  console.log(`  - Working ranges: ${workingRanges.length}`);
  console.log(`  - Failing ranges: ${failingRanges.length}`);
  console.log(`  - Summary saved: sitemap-extended-summary.json`);
  
  console.log(`\n🚀 Next steps:`);
  console.log(`  1. Test a few indexes: node test-individual-sitemap.cjs sitemap-index-6.xml`);
  console.log(`  2. Submit them to GSC one by one as the previous ones get processed`);
  console.log(`  3. Monitor which ranges consistently fail and adjust optimizations`);
}

generateMoreSitemaps().catch(console.error);