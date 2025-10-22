#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const currentDate = new Date().toISOString();

console.log('Updating sitemap_index.xml with current timestamps...');

// Start with priority sitemaps
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://skywardparts.com/sitemap-priority.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://skywardparts.com/sitemap-groups.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;

// Get all sitemap files (excluding index files)
const sitemapFiles = fs.readdirSync(publicDir)
  .filter(f => f.startsWith('sitemap-') && f.endsWith('.xml') && !f.includes('index'))
  .sort((a, b) => {
    // Extract starting number for sorting
    const aMatch = a.match(/sitemap-(\d+)-/);
    const bMatch = b.match(/sitemap-(\d+)-/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.localeCompare(b);
  });

console.log(`Found ${sitemapFiles.length} sitemap files`);

// Add all sitemap references
let count = 0;
for (const file of sitemapFiles) {
  xml += `  <sitemap>
    <loc>https://skywardparts.com/${file}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;
  count++;

  // Progress indicator
  if (count % 500 === 0) {
    console.log(`  Added ${count}/${sitemapFiles.length} sitemaps...`);
  }
}

xml += `</sitemapindex>`;

// Write the new sitemap index
const outputPath = path.join(publicDir, 'sitemap_index.xml');
fs.writeFileSync(outputPath, xml);

console.log(`✅ Updated sitemap_index.xml with ${count + 2} sitemap references`);
console.log(`   Timestamp: ${currentDate}`);
console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
