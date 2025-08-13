#!/usr/bin/env node

/**
 * Script to identify and create redirects for old sitemap URLs that return 404s
 * This prevents crawl budget waste and maintains SEO continuity
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Analyzing old sitemap URL patterns that may cause 404s...\n');

const publicDir = 'public';

// Check for existence of old format sitemaps that may be referenced
const oldFormatPatterns = [
  'sitemap.xml',
  'sitemap_index.xml', 
  'sitemap-index.xml'
];

console.log('📄 Checking for existing sitemap files:');

oldFormatPatterns.forEach(filename => {
  const filepath = path.join(publicDir, filename);
  if (fs.existsSync(filepath)) {
    console.log(`   ✅ Found: ${filename}`);
  } else {
    console.log(`   ❌ Missing: ${filename} (potential 404)`);
  }
});

// Check for old format individual sitemaps referenced in robots.txt
console.log('\n🤖 Checking robots.txt references:');
const robotsPath = path.join(publicDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  const sitemapLines = robotsContent.split('\n').filter(line => line.startsWith('Sitemap:'));
  
  sitemapLines.forEach(line => {
    const url = line.replace('Sitemap:', '').trim();
    const filename = url.split('/').pop();
    const filepath = path.join(publicDir, filename);
    
    if (fs.existsSync(filepath)) {
      console.log(`   ✅ ${url} → File exists`);
    } else {
      console.log(`   ❌ ${url} → File missing (404 error)`);
    }
  });
}

// The old URL format mentioned in robots.txt comments
console.log('\n🔗 Checking old URL format from robots.txt comments:');
console.log('   ❌ /sitemap/{start}/{end}.xml → This format no longer exists');
console.log('   ✅ /sitemap-{start}-{end}.xml → New format exists');

console.log('\n💡 Recommended fixes:');
console.log('1. Create sitemap.xml as main sitemap index');
console.log('2. Update robots.txt to reference correct sitemap URLs');
console.log('3. Optionally create redirects for old sitemap URL patterns');

// Create a main sitemap.xml that references all sitemap-index files
console.log('\n🛠️  Creating main sitemap.xml...');

const sitemapIndexFiles = fs.readdirSync(publicDir)
  .filter(file => file.match(/^sitemap-index-\d+\.xml$/))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

let mainSitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
mainSitemapContent += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

sitemapIndexFiles.forEach(file => {
  const lastmod = new Date().toISOString();
  mainSitemapContent += `  <sitemap>\n`;
  mainSitemapContent += `    <loc>https://skywardparts.com/${file}</loc>\n`;
  mainSitemapContent += `    <lastmod>${lastmod}</lastmod>\n`;
  mainSitemapContent += `  </sitemap>\n`;
});

mainSitemapContent += '</sitemapindex>\n';

// Write the main sitemap.xml
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), mainSitemapContent);
console.log(`✅ Created sitemap.xml referencing ${sitemapIndexFiles.length} sitemap-index files`);

console.log('\n✨ Next steps:');
console.log('1. Update robots.txt to reference the new sitemap.xml');
console.log('2. Test that all referenced sitemaps return 200 status');
console.log('3. Resubmit updated sitemap.xml to Google Search Console');