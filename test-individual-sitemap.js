#!/usr/bin/env node

// Quick script to test a single sitemap index before submitting to GSC

const https = require('https');
const { performance } = require('perf_hooks');

if (process.argv.length < 3) {
  console.log('Usage: node test-individual-sitemap.js <sitemap-filename>');
  console.log('Example: node test-individual-sitemap.js sitemap-index-1.xml');
  process.exit(1);
}

const sitemapFile = process.argv[2];
const sitemapUrl = `https://skywardparts.com/${sitemapFile}`;

async function testSitemapIndex() {
  console.log(`Testing sitemap index: ${sitemapUrl}\n`);
  
  // First, fetch and parse the sitemap index
  const indexContent = await fetchUrl(sitemapUrl);
  if (!indexContent) {
    console.log('❌ Failed to fetch sitemap index');
    return;
  }
  
  console.log('✅ Sitemap index is accessible');
  
  // Extract individual sitemap URLs
  const sitemapUrls = extractSitemapUrls(indexContent);
  console.log(`Found ${sitemapUrls.length} individual sitemaps to test\n`);
  
  // Test first 5 individual sitemaps
  const testCount = Math.min(5, sitemapUrls.length);
  console.log(`Testing first ${testCount} individual sitemaps...`);
  
  let working = 0;
  let failing = 0;
  let totalUrls = 0;
  
  for (let i = 0; i < testCount; i++) {
    const url = sitemapUrls[i];
    const result = await testSitemap(url);
    
    if (result.working) {
      working++;
      totalUrls += result.urlCount || 0;
      console.log(`✅ ${url} - ${result.duration}ms (${result.urlCount || 0} URLs)`);
    } else {
      failing++;
      console.log(`❌ ${url} - ${result.error || result.statusCode} (${result.duration}ms)`);
    }
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`Working: ${working}/${testCount}`);
  console.log(`Failing: ${failing}/${testCount}`);
  console.log(`Total URLs found: ${totalUrls}`);
  console.log(`Success rate: ${(working/testCount*100).toFixed(1)}%`);
  
  if (working >= testCount * 0.8) {
    console.log(`\n🚀 This sitemap index looks good for GSC submission!`);
  } else {
    console.log(`\n⚠️ This sitemap index has issues. Consider fixing timeouts first.`);
  }
}

function fetchUrl(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          console.log(`HTTP ${res.statusCode} for ${url}`);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log(`Error fetching ${url}: ${err.message}`);
      resolve(null);
    });
  });
}

function extractSitemapUrls(xmlContent) {
  const urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

function testSitemap(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const req = https.get(url, { timeout: 8000 }, (res) => {
      let data = '';
      let urlCount = 0;
      
      res.on('data', (chunk) => {
        data += chunk;
        // Count URLs as we receive data
        const matches = chunk.toString().match(/<url>/g);
        if (matches) urlCount += matches.length;
      });
      
      res.on('end', () => {
        const duration = Math.round(performance.now() - startTime);
        
        if (res.statusCode === 200) {
          resolve({ 
            working: true, 
            duration, 
            urlCount: urlCount,
            size: data.length 
          });
        } else {
          resolve({ 
            working: false, 
            statusCode: res.statusCode, 
            duration 
          });
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        working: false, 
        error: 'timeout', 
        duration: 8000 
      });
    });
    
    req.on('error', (err) => {
      resolve({ 
        working: false, 
        error: err.message, 
        duration: Math.round(performance.now() - startTime) 
      });
    });
  });
}

testSitemapIndex().catch(console.error);