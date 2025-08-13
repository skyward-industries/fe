#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function fixSitemapUrls() {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🔧 Fixing sitemap URLs to remove nsn- prefix...\n');
  
  // Find all sitemap files
  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.xml') && file.includes('sitemap'));
  
  console.log(`Found ${sitemapFiles.length} sitemap files to check\n`);
  
  let totalFixed = 0;
  
  sitemapFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Count URLs with nsn- prefix
    const nsnMatches = content.match(/\/nsn-\d{4}-\d{2}-\d{3}-\d{4}/g) || [];
    
    if (nsnMatches.length > 0) {
      // Replace all nsn-XXXX-XX-XXX-XXXX with just XXXX-XX-XXX-XXXX
      content = content.replace(/\/nsn-(\d{4}-\d{2}-\d{3}-\d{4})/g, '/$1');
      
      // Write back
      fs.writeFileSync(filePath, content);
      
      totalFixed += nsnMatches.length;
      console.log(`✅ ${file}: Fixed ${nsnMatches.length} URLs`);
    } else {
      console.log(`✓ ${file}: No nsn- prefixes found`);
    }
  });
  
  console.log(`\n✨ Total URLs fixed: ${totalFixed}`);
  
  if (totalFixed > 0) {
    console.log('\nNext steps:');
    console.log('1. Commit and deploy these changes');
    console.log('2. Clear any CDN caches');
    console.log('3. Resubmit sitemaps to Google Search Console');
  }
}

fixSitemapUrls();