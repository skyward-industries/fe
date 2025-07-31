#!/usr/bin/env node

/**
 * Temporarily disable sitemap generation
 * This modifies the sitemap API to return empty responses
 */

import fs from 'fs';
import path from 'path';

const sitemapApiPath = 'src/app/api/sitemap-parts/route.ts';

async function disableSitemaps() {
  try {
    console.log('🚫 Temporarily disabling sitemap generation...');
    
    // Read current file
    const currentContent = fs.readFileSync(sitemapApiPath, 'utf8');
    
    // Create backup
    const backupPath = sitemapApiPath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, currentContent);
    console.log(`📁 Backup created: ${backupPath}`);
    
    // Create disabled version with proper import
    const disabledContent = `import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // TEMPORARILY DISABLED - Return empty responses to prevent connection overload
  console.log('🚫 Sitemap API temporarily disabled to prevent connection overload');
  
  return NextResponse.json([], {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'X-Sitemap-Disabled': 'true',
      'X-Disabled-Reason': 'Connection overload prevention',
      'X-Disabled-At': new Date().toISOString()
    }
  });
}`;

    // Write disabled version
    fs.writeFileSync(sitemapApiPath, disabledContent);
    console.log('✅ Sitemap API disabled');
    console.log('📝 All sitemap requests will return empty responses');
    console.log('⏰ Disabled at:', new Date().toISOString());
    
    console.log('');
    console.log('💡 To re-enable later, restore from backup:');
    console.log(`   cp ${backupPath} ${sitemapApiPath}`);
    
  } catch (error) {
    console.error('❌ Error disabling sitemaps:', error.message);
  }
}

// Run the disable
disableSitemaps();