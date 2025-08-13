#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function refreshSitemapDates() {
  const publicDir = path.join(process.cwd(), 'public');
  const today = new Date().toISOString();
  
  console.log('🚀 Refreshing/Adding sitemap dates to trigger crawling...\n');
  
  // Find all sitemap files
  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.xml') && file.includes('sitemap'));
  
  console.log(`Found ${sitemapFiles.length} sitemap files to update\n`);
  
  let totalUrlsUpdated = 0;
  let filesWithoutLastmod = 0;
  
  sitemapFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Count URLs before update
    const urlCount = (content.match(/<url>/g) || []).length;
    const sitemapCount = (content.match(/<sitemap>/g) || []).length;
    const hasLastmod = content.includes('<lastmod>');
    
    if (!hasLastmod && urlCount > 0) {
      filesWithoutLastmod++;
      // Add lastmod to URLs that don't have it
      content = content.replace(/<\/loc>/g, `</loc>\n    <lastmod>${today}</lastmod>`);
    }
    
    // Update all existing lastmod dates to today
    content = content.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
    
    // Write back
    fs.writeFileSync(filePath, content);
    
    const totalUpdated = urlCount + sitemapCount;
    totalUrlsUpdated += totalUpdated;
    
    console.log(`✅ ${file}: Updated ${totalUpdated} dates${!hasLastmod ? ' (added lastmod)' : ''}`);
  });
  
  console.log(`\n✨ Total dates updated: ${totalUrlsUpdated}`);
  console.log(`📅 Files without lastmod that were fixed: ${filesWithoutLastmod}`);
  console.log('\nNext steps:');
  console.log('1. Deploy these changes to production');
  console.log('2. Submit sitemap to Google: https://www.google.com/ping?sitemap=https://skywardparts.com/sitemap.xml');
  console.log('3. Go to Google Search Console and manually submit the sitemap');
  console.log('4. Use the URL Inspection tool for important pages');
}

refreshSitemapDates();