#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function generateSiteMapIndexContent(fileNumber, urlsPerFile) {
  // Each sitemap-index file should reference multiple new sitemap-start-end.xml files
  // Let's make each sitemap-index file cover a larger range to reference 10-15 sitemap files
  // New format: sitemap-1-2000.xml, sitemap-2001-4000.xml, etc. (2000 URLs per file)
  
  // Instead of 3000 URLs per index, let's use a larger range to get 10-15 sitemap references
  const sitemapsPerIndex = 12; // This will give us 12 sitemap files per index
  const urlsPerSitemap = 2000;
  const urlsPerIndex = sitemapsPerIndex * urlsPerSitemap; // 24000 URLs per index
  
  const startNum = (fileNumber - 1) * urlsPerIndex + 1;
  const endNum = fileNumber * urlsPerIndex;
  
  const sitemapRefs = [];
  
  // Generate sitemap files for this range
  for (let i = 0; i < sitemapsPerIndex; i++) {
    const currentStart = startNum + (i * urlsPerSitemap);
    const currentEnd = currentStart + urlsPerSitemap - 1;
    
    sitemapRefs.push(`https://skywardparts.com/sitemap-${currentStart}-${currentEnd}.xml`);
  }
  
  const lastmod = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRefs.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

function regenerateSitemapIndexes() {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🚀 Regenerating sitemap-index-X.xml files to reference new sitemap structure...\n');
  
  // Find existing sitemap-index files
  const indexFiles = fs.readdirSync(publicDir)
    .filter(file => file.match(/^sitemap-index-\d+\.xml$/))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      const bNum = parseInt(b.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      return aNum - bNum;
    });
  
  console.log(`📁 Found ${indexFiles.length} sitemap-index files to update\n`);
  
  if (indexFiles.length === 0) {
    console.log('⚠️ No sitemap-index-X.xml files found');
    return;
  }
  
  const urlsPerFile = 3000; // Old format had 3000 URLs per file
  let totalUpdated = 0;
  let totalErrors = 0;
  
  // Process each index file
  indexFiles.forEach((file, index) => {
    const filePath = path.join(publicDir, file);
    const fileNum = parseInt(file.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
    
    console.log(`📄 Processing ${file} (${index + 1}/${indexFiles.length})`);
    
    try {
      // Generate new sitemap index content pointing to new format files
      const sitemapContent = generateSiteMapIndexContent(fileNum, urlsPerFile);
      
      // Write the updated content
      fs.writeFileSync(filePath, sitemapContent);
      
      // Count how many sitemap references we added
      const sitemapCount = (sitemapContent.match(/<sitemap>/g) || []).length;
      
      console.log(`   ✅ Updated with ${sitemapCount} sitemap references to new format`);
      
      totalUpdated++;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      totalErrors++;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully updated: ${totalUpdated} files`);
  console.log(`   ❌ Errors: ${totalErrors} files`);
  console.log(`\n✨ All sitemap-index-X.xml files now reference the new sitemap-start-end.xml format!`);
}

// Option to update specific range only
function updateSpecificRange(startFile, endFile) {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log(`🚀 Updating sitemap-index files ${startFile} to ${endFile}...\n`);
  
  // Find files in the specified range
  const indexFiles = fs.readdirSync(publicDir)
    .filter(file => {
      const match = file.match(/^sitemap-index-(\d+)\.xml$/);
      if (match) {
        const fileNum = parseInt(match[1]);
        return fileNum >= startFile && fileNum <= endFile;
      }
      return false;
    })
    .sort((a, b) => {
      const aNum = parseInt(a.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      const bNum = parseInt(b.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      return aNum - bNum;
    });
  
  console.log(`📁 Found ${indexFiles.length} sitemap-index files in range ${startFile}-${endFile}\n`);
  
  const urlsPerFile = 3000;
  let totalUpdated = 0;
  let totalErrors = 0;
  
  indexFiles.forEach((file, index) => {
    const filePath = path.join(publicDir, file);
    const fileNum = parseInt(file.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
    
    console.log(`📄 Processing ${file} (${index + 1}/${indexFiles.length})`);
    
    try {
      const sitemapContent = generateSiteMapIndexContent(fileNum, urlsPerFile);
      fs.writeFileSync(filePath, sitemapContent);
      
      const sitemapCount = (sitemapContent.match(/<sitemap>/g) || []).length;
      console.log(`   ✅ Updated with ${sitemapCount} sitemap references to new format`);
      
      totalUpdated++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      totalErrors++;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully updated: ${totalUpdated} files`);
  console.log(`   ❌ Errors: ${totalErrors} files`);
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length === 2) {
  const startFile = parseInt(args[0]);
  const endFile = parseInt(args[1]);
  updateSpecificRange(startFile, endFile);
} else {
  regenerateSitemapIndexes();
}