#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function verifySitemaps() {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('🔍 Verifying sitemap structure...\n');
  
  // Check for main sitemap files
  const mainSitemaps = ['sitemap.xml', 'sitemap_index.xml', 'sitemap-priority.xml', 'sitemap-groups.xml'];
  
  console.log('1. Main sitemap files:');
  mainSitemaps.forEach(file => {
    const exists = fs.existsSync(path.join(publicDir, file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });
  
  // Find OLD format sitemap files (sitemap-index-N.xml)
  const oldFormatFiles = fs.readdirSync(publicDir)
    .filter(file => file.match(/^sitemap-index-\d+\.xml$/))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      const bNum = parseInt(b.match(/sitemap-index-(\d+)\.xml/)?.[1] || '0');
      return aNum - bNum;
    });
  
  console.log(`\n2. OLD format files (sitemap-index-N.xml): ${oldFormatFiles.length} found`);
  if (oldFormatFiles.length > 0) {
    console.log(`   Range: ${oldFormatFiles[0]} to ${oldFormatFiles[oldFormatFiles.length - 1]}`);
  }
  
  // Find NEW format sitemap files (sitemap-N-N.xml)
  const newFormatFiles = fs.readdirSync(publicDir)
    .filter(file => file.match(/^sitemap-\d+-\d+\.xml$/))
    .sort((a, b) => {
      const aNum = parseInt(a.match(/sitemap-(\d+)-/)?.[1] || '0');
      const bNum = parseInt(b.match(/sitemap-(\d+)-/)?.[1] || '0');
      return aNum - bNum;
    });
  
  console.log(`\n3. NEW format files (sitemap-N-N.xml): ${newFormatFiles.length} found`);
  if (newFormatFiles.length > 0) {
    console.log(`   Range: ${newFormatFiles[0]} to ${newFormatFiles[newFormatFiles.length - 1]}`);
  }
  
  const numberedSitemaps = newFormatFiles; // For compatibility with rest of code
  
  if (numberedSitemaps.length > 0) {
    // Check for gaps in numbering
    console.log('\n4. Checking for gaps in NEW format sequence:');
    let expectedStart = 1;
    let gaps = [];
    
    numberedSitemaps.forEach(file => {
      const match = file.match(/sitemap-(\d+)-(\d+)\.xml/);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        
        if (start !== expectedStart) {
          gaps.push(`Gap: Expected ${expectedStart}, found ${start}`);
        }
        
        expectedStart = end + 1;
      }
    });
    
    if (gaps.length === 0) {
      console.log('   ✅ No gaps found - sequence is continuous');
    } else {
      console.log('   ⚠️ Gaps found:');
      gaps.forEach(gap => console.log(`      - ${gap}`));
    }
    
    // Show first and last files
    console.log('\n5. NEW format file range:');
    console.log(`   First: ${numberedSitemaps[0]}`);
    console.log(`   Last: ${numberedSitemaps[numberedSitemaps.length - 1]}`);
    
    // Estimate total URLs
    const lastFile = numberedSitemaps[numberedSitemaps.length - 1];
    const lastMatch = lastFile.match(/sitemap-\d+-(\d+)\.xml/);
    if (lastMatch) {
      const totalUrls = parseInt(lastMatch[1]);
      console.log(`   Estimated NEW format URLs: ${totalUrls.toLocaleString()}`);
    }
  }
  
  // Calculate total URLs from both formats
  const oldFormatUrls = oldFormatFiles.length * 3000; // Old format had 3000 per file
  const newFormatUrls = newFormatFiles.length * 2000; // New format has 2000 per file
  console.log(`\n6. Total URL estimates:`);
  console.log(`   OLD format URLs: ${oldFormatUrls.toLocaleString()} (${oldFormatFiles.length} files × 3000)`);
  console.log(`   NEW format URLs: ${newFormatUrls.toLocaleString()} (${newFormatFiles.length} files × 2000)`);
  console.log(`   TOTAL URLs: ${(oldFormatUrls + newFormatUrls).toLocaleString()}`);
  
  // Check current sitemap.xml content
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const urlCount = (content.match(/<loc>/g) || []).length;
    const hasPriority = content.includes('sitemap-priority.xml');
    const hasGroups = content.includes('sitemap-groups.xml');
    const hasNumbered = content.includes('sitemap-1-2000.xml');
    
    const hasOldFormat = content.includes('sitemap-index-1.xml');
    
    console.log('\n7. Current sitemap.xml content:');
    console.log(`   Total entries: ${urlCount}`);
    console.log(`   ${hasPriority ? '✅' : '❌'} Contains sitemap-priority.xml`);
    console.log(`   ${hasGroups ? '✅' : '❌'} Contains sitemap-groups.xml`);
    console.log(`   ${hasOldFormat ? '✅' : '❌'} Contains old format (sitemap-index-1.xml)`);
    console.log(`   ${hasNumbered ? '✅' : '❌'} Contains new format (sitemap-1-2000.xml)`);
  }
}

// Run verification
verifySitemaps();