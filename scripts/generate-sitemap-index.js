#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function generateSitemapIndex() {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🚀 Generating sitemap index...');
  
  // Find all sitemap files in public directory
  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'))
    .sort((a, b) => {
      // Extract numbers from filenames like "sitemap-1-2000.xml"
      const aMatch = a.match(/sitemap-(\d+)-(\d+)\.xml/);
      const bMatch = b.match(/sitemap-(\d+)-(\d+)\.xml/);
      
      if (aMatch && bMatch) {
        const aStart = parseInt(aMatch[1]);
        const bStart = parseInt(bMatch[1]);
        return aStart - bStart;
      }
      return 0;
    });
  
  console.log(`📁 Found ${sitemapFiles.length} sitemap files`);
  
  if (sitemapFiles.length === 0) {
    console.log('⚠️ No sitemap files found. Run generate-sitemaps first.');
    return;
  }
  
  // Show first and last few files for verification
  console.log('First files:', sitemapFiles.slice(0, 3));
  console.log('Last files:', sitemapFiles.slice(-3));
  
  const lastmod = new Date().toISOString();
  
  // Generate the sitemap index
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://skywardparts.com/sitemap-priority.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://skywardparts.com/sitemap-groups.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
${sitemapFiles.map(file => `  <sitemap>
    <loc>https://skywardparts.com/${file}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  // Write the sitemap index
  const indexPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(indexPath, sitemapIndex);
  
  console.log(`✅ Generated sitemap.xml with ${sitemapFiles.length + 2} sitemaps`);
  console.log(`📄 File saved to: ${indexPath}`);
  
  // Also create a sitemap_index.xml for compatibility
  fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), sitemapIndex);
  console.log(`✅ Also created sitemap_index.xml for compatibility`);
  
  // Show summary
  const totalUrls = sitemapFiles.length * 2000; // Approximate
  console.log(`\n📊 Summary:`);
  console.log(`   - Static sitemaps: 2 (priority, groups)`);
  console.log(`   - Part sitemaps: ${sitemapFiles.length}`);
  console.log(`   - Estimated total URLs: ${totalUrls.toLocaleString()}`);
}

// Run the generator
generateSitemapIndex();