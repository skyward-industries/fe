#!/usr/bin/env node

/**
 * Quick Sitemap Date Refresh
 * Updates only the lastmod timestamps in existing sitemaps without regenerating.
 */

import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function refreshSitemapDates() {
  console.log('🔄 Refreshing Sitemap Dates\n');

  const newDate = new Date().toISOString();
  console.log(`📅 New date: ${newDate}\n`);

  const sitemapFiles = fs.readdirSync(PUBLIC_DIR)
    .filter(file => file.match(/^sitemap.*\.xml$/))
    .sort();

  if (sitemapFiles.length === 0) {
    console.error('❌ No sitemap files found');
    process.exit(1);
  }

  console.log(`📋 Found ${sitemapFiles.length} sitemap files\n`);

  let updated = 0;

  for (const file of sitemapFiles) {
    const filePath = path.join(PUBLIC_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      /<lastmod>[^<]+<\/lastmod>/g,
      `<lastmod>${newDate}</lastmod>`
    );
    fs.writeFileSync(filePath, updatedContent);
    updated++;

    if (updated % 100 === 0) {
      console.log(`   ✓ Updated ${updated}/${sitemapFiles.length} files...`);
    }
  }

  console.log(`\n✅ Updated ${updated} files with date: ${newDate}\n`);
}

refreshSitemapDates();
