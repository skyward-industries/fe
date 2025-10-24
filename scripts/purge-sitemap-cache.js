#!/usr/bin/env node

/**
 * Cache Busting & CDN Purge for Sitemaps
 *
 * Purges sitemap caches from Cloudflare CDN and forces fresh content delivery.
 * Ensures search engines get the latest sitemap data.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = 'https://skywardparts.com';
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

/**
 * Purge Cloudflare cache for specific URLs
 */
async function purgeCloudflareCache(urls) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    console.warn('⚠️  Cloudflare credentials not configured');
    console.log('   Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN to enable cache purging');
    return { skipped: true };
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ files: urls });

    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.success) {
            resolve({
              success: true,
              purgedCount: urls.length,
              response
            });
          } else {
            reject(new Error(`Cloudflare purge failed: ${JSON.stringify(response.errors)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse Cloudflare response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Purge everything (use with caution)
 */
async function purgeEverything() {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    console.warn('⚠️  Cloudflare credentials not configured');
    return { skipped: true };
  }

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ purge_everything: true });

    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.success) {
            resolve({ success: true, response });
          } else {
            reject(new Error(`Cloudflare purge everything failed: ${JSON.stringify(response.errors)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse Cloudflare response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Get list of sitemap URLs to purge
 */
function getSitemapUrls() {
  const publicDir = path.join(process.cwd(), 'public');

  if (!fs.existsSync(publicDir)) {
    throw new Error('Public directory not found');
  }

  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('sitemap') && file.endsWith('.xml'))
    .map(file => `${BASE_URL}/${file}`);

  return sitemapFiles;
}

/**
 * Add cache-busting query parameters to sitemap URLs
 */
function addCacheBustingParams() {
  console.log('🔧 Adding cache-busting parameters...');

  const publicDir = path.join(process.cwd(), 'public');
  const sitemapIndexPath = path.join(publicDir, 'sitemap.xml');

  if (!fs.existsSync(sitemapIndexPath)) {
    console.warn('   ⚠️  Sitemap index not found, skipping');
    return false;
  }

  let content = fs.readFileSync(sitemapIndexPath, 'utf8');

  // Add version parameter to force cache refresh
  const version = Date.now();
  const updatedContent = content.replace(
    /(<loc>https:\/\/skywardparts\.com\/(sitemap-[^<]+\.xml))<\/loc>/g,
    `$1?v=${version}</loc>`
  );

  if (updatedContent !== content) {
    fs.writeFileSync(sitemapIndexPath, updatedContent);
    console.log(`   ✅ Added cache-busting parameter: v=${version}`);
    return true;
  }

  console.log('   ℹ️  No changes needed');
  return false;
}

/**
 * Remove cache-busting parameters (cleanup)
 */
function removeCacheBustingParams() {
  console.log('🧹 Removing cache-busting parameters...');

  const publicDir = path.join(process.cwd(), 'public');
  const sitemapIndexPath = path.join(publicDir, 'sitemap.xml');

  if (!fs.existsSync(sitemapIndexPath)) {
    console.warn('   ⚠️  Sitemap index not found, skipping');
    return false;
  }

  let content = fs.readFileSync(sitemapIndexPath, 'utf8');

  // Remove version parameters
  const cleanedContent = content.replace(
    /(<loc>https:\/\/skywardparts\.com\/(sitemap-[^?<]+\.xml))\?v=\d+<\/loc>/g,
    '$1</loc>'
  );

  if (cleanedContent !== content) {
    fs.writeFileSync(sitemapIndexPath, cleanedContent);
    console.log('   ✅ Removed cache-busting parameters');
    return true;
  }

  console.log('   ℹ️  No parameters to remove');
  return false;
}

/**
 * Main cache purge function
 */
async function purgeSitemapCache(options = {}) {
  const { purgeAll = false, addCacheBusting = false } = options;

  console.log('🚀 Sitemap Cache Purge');
  console.log('======================\n');

  try {
    // Option 1: Add cache-busting parameters
    if (addCacheBusting) {
      addCacheBustingParams();
      console.log('');
    }

    // Option 2: Purge specific sitemap URLs
    if (!purgeAll) {
      console.log('📋 Getting sitemap URLs...');
      const sitemapUrls = getSitemapUrls();
      console.log(`   Found ${sitemapUrls.length} sitemap URLs`);
      console.log('');

      // Cloudflare has a limit of 30 URLs per request
      const batchSize = 30;
      const batches = [];

      for (let i = 0; i < sitemapUrls.length; i += batchSize) {
        batches.push(sitemapUrls.slice(i, i + batchSize));
      }

      console.log('🔥 Purging Cloudflare cache...');
      console.log(`   Processing ${batches.length} batches...`);

      let totalPurged = 0;

      for (let i = 0; i < batches.length; i++) {
        try {
          const result = await purgeCloudflareCache(batches[i]);

          if (result.skipped) {
            console.log('   ⚠️  Skipped (credentials not configured)');
            break;
          }

          totalPurged += result.purgedCount;
          console.log(`   ✅ Batch ${i + 1}/${batches.length}: ${result.purgedCount} URLs purged`);

          // Small delay between batches
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`   ❌ Batch ${i + 1} failed:`, error.message);
        }
      }

      if (totalPurged > 0) {
        console.log(`\n✅ Total URLs purged: ${totalPurged}`);
      }

    } else {
      // Option 3: Purge everything (nuclear option)
      console.log('💣 Purging ALL cache (use with caution)...');

      try {
        const result = await purgeEverything();

        if (result.skipped) {
          console.log('   ⚠️  Skipped (credentials not configured)');
        } else {
          console.log('   ✅ All cache purged successfully');
        }
      } catch (error) {
        console.error('   ❌ Purge everything failed:', error.message);
      }
    }

    console.log('');
    console.log('🎉 Cache purge complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   - Wait 1-2 minutes for cache purge to propagate');
    console.log('   - Verify fresh content at:', `${BASE_URL}/sitemap.xml`);
    console.log('   - Search engines will fetch fresh sitemaps on next crawl');

  } catch (error) {
    console.error('❌ Error during cache purge:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const purgeAll = args.includes('--purge-all') || args.includes('-a');
const addCacheBusting = args.includes('--cache-bust') || args.includes('-c');

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  purgeSitemapCache({ purgeAll, addCacheBusting });
}

export { purgeSitemapCache, purgeCloudflareCache, addCacheBustingParams, removeCacheBustingParams };
