#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function generateSitemapIndex() {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🚀 Generating sitemap index...');
  
  // Find OLD format sitemap files (sitemap-index-1.xml, etc.)
  const oldFormatFiles = fs.readdirSync(publicDir)
    .filter(file => file.match(/^sitemap-index-\d+\.xml$/))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      const bNum = parseInt(b.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      return aNum - bNum;
    });
  
  console.log(`📁 Found ${oldFormatFiles.length} OLD format files (sitemap-index-N.xml)`);
  
  // Find NEW format sitemap files (sitemap-1-2000.xml, etc.)
  const newFormatFiles = fs.readdirSync(publicDir)
    .filter(file => file.match(/^sitemap-\d+-\d+\.xml$/))
    .sort((a, b) => {
      const aMatch = a.match(/sitemap-(\d+)-(\d+)\.xml/);
      const bMatch = b.match(/sitemap-(\d+)-(\d+)\.xml/);
      
      if (aMatch && bMatch) {
        const aStart = parseInt(aMatch[1]);
        const bStart = parseInt(bMatch[1]);
        return aStart - bStart;
      }
      return 0;
    });
  
  console.log(`📁 Found ${newFormatFiles.length} NEW format files (sitemap-N-N.xml)`);
  
  // Combine both formats
  const allSitemapFiles = [...oldFormatFiles, ...newFormatFiles];
  
  console.log(`📁 Total: ${allSitemapFiles.length} sitemap files`);
  
  if (allSitemapFiles.length === 0) {
    console.log('⚠️ No sitemap files found. Run generate-sitemaps first.');
    return;
  }
  
  // Show sample files for verification
  if (oldFormatFiles.length > 0) {
    console.log('\nOLD format samples:');
    console.log('  First:', oldFormatFiles.slice(0, 2));
    console.log('  Last:', oldFormatFiles.slice(-2));
  }
  
  if (newFormatFiles.length > 0) {
    console.log('\nNEW format samples:');
    console.log('  First:', newFormatFiles.slice(0, 2));
    console.log('  Last:', newFormatFiles.slice(-2));
  }
  
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
${allSitemapFiles.map(file => `  <sitemap>
    <loc>https://skywardparts.com/${file}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  // Write the sitemap index
  const indexPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(indexPath, sitemapIndex);
  
  console.log(`✅ Generated sitemap.xml with ${allSitemapFiles.length + 2} sitemaps`);
  console.log(`📄 File saved to: ${indexPath}`);
  
  // Also create a sitemap_index.xml for compatibility
  fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), sitemapIndex);
  console.log(`✅ Also created sitemap_index.xml for compatibility`);
  
  // Show summary
  const oldFormatUrls = oldFormatFiles.length * 3000; // Old format had 3000 per file
  const newFormatUrls = newFormatFiles.length * 2000; // New format has 2000 per file
  const totalUrls = oldFormatUrls + newFormatUrls;
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Static sitemaps: 2 (priority, groups)`);
  console.log(`   - OLD format sitemaps: ${oldFormatFiles.length} (sitemap-index-N.xml)`);
  console.log(`   - NEW format sitemaps: ${newFormatFiles.length} (sitemap-N-N.xml)`);
  console.log(`   - Total part sitemaps: ${allSitemapFiles.length}`);
  console.log(`   - Estimated total URLs: ${totalUrls.toLocaleString()}`);
}

// Run the generator
generateSitemapIndex();