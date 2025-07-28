#!/usr/bin/env node

// Script to test sitemap generation for various ID ranges
// This helps identify which ranges are timing out or returning 404s

const https = require('https');
const http = require('http');

const baseUrl = process.env.SITEMAP_BASE_URL || 'http://localhost:3000';
const isHttps = baseUrl.startsWith('https');
const client = isHttps ? https : http;

// Test ranges - adjust based on your data
const testRanges = [
  { start: 1, end: 3000 },
  { start: 3001, end: 6000 },
  { start: 10001, end: 13000 },
  { start: 50001, end: 53000 },
  { start: 100001, end: 103000 },
  { start: 500001, end: 503000 },
  { start: 1000001, end: 1003000 },
  { start: 5000001, end: 5003000 },
  { start: 10000001, end: 10003000 },
  { start: 20000001, end: 20003000 },
  { start: 50000001, end: 50003000 },
];

async function testSitemapRange(start, end) {
  const url = `${baseUrl}/sitemap/${start}/${end}.xml`;
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const options = {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Sitemap-Test/1.0'
      }
    };
    
    const req = client.get(url, options, (res) => {
      let data = '';
      let chunks = 0;
      
      res.on('data', (chunk) => {
        data += chunk;
        chunks++;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const partsCount = res.headers['x-parts-count'] || 'unknown';
        const isEmpty = res.headers['x-empty-sitemap'] === 'true';
        const urlCount = (data.match(/<url>/g) || []).length;
        
        resolve({
          range: `${start}-${end}`,
          status: res.statusCode,
          duration: duration,
          partsCount: partsCount,
          urlCount: urlCount,
          isEmpty: isEmpty,
          size: data.length,
          chunks: chunks,
          success: res.statusCode === 200
        });
      });
    });
    
    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        range: `${start}-${end}`,
        status: 'error',
        duration: duration,
        error: err.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        range: `${start}-${end}`,
        status: 'timeout',
        duration: duration,
        success: false
      });
    });
  });
}

async function runTests() {
  console.log(`Testing sitemap generation at ${baseUrl}`);
  console.log('========================================\n');
  
  const results = [];
  
  for (const range of testRanges) {
    process.stdout.write(`Testing range ${range.start}-${range.end}... `);
    const result = await testSitemapRange(range.start, range.end);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status} (${result.duration}ms, ${result.urlCount} URLs, ${result.size} bytes)`);
    } else {
      console.log(`❌ ${result.status} (${result.duration}ms) ${result.error || ''}`);
    }
  }
  
  console.log('\n========================================');
  console.log('Summary:');
  console.log('========================================\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length || 0;
  
  console.log(`Total ranges tested: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Average duration (successful): ${Math.round(avgDuration)}ms`);
  
  if (failed.length > 0) {
    console.log('\nFailed ranges:');
    failed.forEach(r => {
      console.log(`  - ${r.range}: ${r.status} (${r.duration}ms)`);
    });
  }
  
  // Find performance issues
  const slowRanges = successful.filter(r => r.duration > 5000);
  if (slowRanges.length > 0) {
    console.log('\nSlow ranges (>5s):');
    slowRanges.forEach(r => {
      console.log(`  - ${r.range}: ${r.duration}ms`);
    });
  }
  
  // Save detailed results
  const fs = require('fs');
  fs.writeFileSync('sitemap-test-results.json', JSON.stringify(results, null, 2));
  console.log('\nDetailed results saved to sitemap-test-results.json');
}

// Run the tests
runTests().catch(console.error);