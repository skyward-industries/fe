#!/usr/bin/env node

// Script to create multiple smaller sitemap indexes
// This reduces the risk of GSC timeouts and improves processing success

const fs = require('fs');
const https = require('https');
const { performance } = require('perf_hooks');

const MAX_SITEMAPS_PER_INDEX = 100; // GSC recommends keeping indexes smaller
const TEST_TIMEOUT = 10000; // 10 seconds to test each sitemap

// Test if a sitemap URL is accessible
function testSitemap(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const req = https.get(url, { timeout: TEST_TIMEOUT }, (res) => {
      const duration = performance.now() - startTime;
      
      if (res.statusCode === 200) {
        // Check if it has content by reading a bit
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

async function createSplitSitemaps() {
  console.log('Creating split sitemap indexes...\n');
  
  // Define the ranges based on what typically works
  const ranges = [];
  
  // Generate ranges - focusing on working ones first
  for (let start = 1; start <= 1000000; start += 3000) {
    const end = start + 2999;
    ranges.push({ start, end });
  }
  
  console.log(`Testing ${ranges.length} sitemap ranges...`);
  
  // Test sitemaps in batches to identify working ones
  const workingRanges = [];
  const failingRanges = [];
  
  // Test first 200 ranges to identify the pattern
  const testRanges = ranges.slice(0, 200);
  console.log(`Testing first ${testRanges.length} ranges to identify working patterns...`);
  
  for (let i = 0; i < testRanges.length; i += 10) {
    const batch = testRanges.slice(i, i + 10);
    const promises = batch.map(range => 
      testSitemap(`https://skywardparts.com/sitemap/${range.start}/${range.end}.xml`)
    );
    
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
    
    // Progress update
    if ((i + 10) % 50 === 0) {
      console.log(`Progress: ${i + 10}/${testRanges.length} tested`);
    }
  }
  
  console.log(`\nTest Results:`);
  console.log(`Working ranges: ${workingRanges.length}`);
  console.log(`Failing ranges: ${failingRanges.length}`);
  
  // Create multiple sitemap indexes from working ranges
  const sitemapIndexes = [];
  
  for (let i = 0; i < workingRanges.length; i += MAX_SITEMAPS_PER_INDEX) {
    const chunk = workingRanges.slice(i, i + MAX_SITEMAPS_PER_INDEX);
    const indexNum = Math.floor(i / MAX_SITEMAPS_PER_INDEX) + 1;
    
    const sitemapEntries = chunk.map(range => `  <sitemap>
    <loc>https://skywardparts.com/sitemap/${range.start}/${range.end}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\\n');
    
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
    
    const filename = `public/sitemap-index-${indexNum}.xml`;
    fs.writeFileSync(filename, sitemapIndexXml);
    
    sitemapIndexes.push({
      filename,
      ranges: chunk.length,
      startRange: chunk[0].start,
      endRange: chunk[chunk.length - 1].end
    });
    
    console.log(`Created ${filename} with ${chunk.length} working sitemaps (${chunk[0].start}-${chunk[chunk.length - 1].end})`);
  }
  
  // Create a master sitemap index that points to the split indexes
  const masterSitemapEntries = sitemapIndexes.map((index, i) => `  <sitemap>
    <loc>https://skywardparts.com/sitemap-index-${i + 1}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\\n');
  
  const masterSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${masterSitemapEntries}
</sitemapindex>`;
  
  fs.writeFileSync('public/sitemap-master-index.xml', masterSitemapXml);
  
  // Create summary
  const summary = {
    created: new Date().toISOString(),
    totalWorkingRanges: workingRanges.length,
    totalFailingRanges: failingRanges.length,
    sitemapIndexesCreated: sitemapIndexes.length,
    maxSitemapsPerIndex: MAX_SITEMAPS_PER_INDEX,
    indexes: sitemapIndexes,
    failingRanges: failingRanges.slice(0, 20) // First 20 failing ranges
  };
  
  fs.writeFileSync('sitemap-split-summary.json', JSON.stringify(summary, null, 2));
  
  console.log(`\\n✅ Created ${sitemapIndexes.length} sitemap indexes:`);
  sitemapIndexes.forEach((index, i) => {
    console.log(`  - sitemap-index-${i + 1}.xml: ${index.ranges} sitemaps (${index.startRange}-${index.endRange})`);
  });
  
  console.log(`\\n📋 Summary:`);
  console.log(`  - Master index: sitemap-master-index.xml`);
  console.log(`  - Working ranges: ${workingRanges.length}`);
  console.log(`  - Failing ranges: ${failingRanges.length}`);
  console.log(`  - Summary saved: sitemap-split-summary.json`);
  
  console.log(`\\n🚀 Next steps:`);
  console.log(`  1. Submit sitemap-index-1.xml to GSC first (contains the best working ranges)`);
  console.log(`  2. Once successful, submit the remaining indexes one by one`);
  console.log(`  3. Or use sitemap-master-index.xml to submit all at once`);
}

createSplitSitemaps().catch(console.error);