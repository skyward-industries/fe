#!/usr/bin/env node

/**
 * IndexNow Protocol Integration
 *
 * Notifies search engines immediately when sitemaps are updated using the IndexNow protocol.
 * Supported search engines: Bing, Yandex, Seznam.cz
 *
 * Google doesn't support IndexNow but respects frequent sitemap updates.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://skywardparts.com';
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || 'your-api-key-here';

// IndexNow endpoints (all share the same protocol)
const INDEXNOW_ENDPOINTS = [
  'api.indexnow.org', // Primary endpoint (works for all)
  'www.bing.com',     // Bing-specific
  'yandex.com',       // Yandex-specific
];

/**
 * Submit URLs to IndexNow
 */
async function submitToIndexNow(urls, host = INDEXNOW_ENDPOINTS[0]) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: BASE_URL.replace('https://', '').replace('http://', ''),
      key: INDEXNOW_API_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_API_KEY}.txt`,
      urlList: urls
    });

    const options = {
      hostname: host,
      path: '/indexnow',
      method: 'POST',
      headers: {
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
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve({ success: true, statusCode: res.statusCode, host, data });
        } else {
          reject(new Error(`IndexNow submission failed: ${res.statusCode} - ${data}`));
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
 * Ping Google with sitemap location
 */
async function pingGoogle(sitemapUrl) {
  return new Promise((resolve, reject) => {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    https.get(pingUrl, (res) => {
      if (res.statusCode === 200) {
        resolve({ success: true, statusCode: res.statusCode });
      } else {
        reject(new Error(`Google ping failed: ${res.statusCode}`));
      }
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Get list of sitemap URLs from sitemap index
 */
function getSitemapUrls() {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapIndexPath = path.join(publicDir, 'sitemap.xml');

  if (!fs.existsSync(sitemapIndexPath)) {
    throw new Error('Sitemap index not found at public/sitemap.xml');
  }

  // Get list of individual sitemap files
  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'))
    .map(file => `${BASE_URL}/${file}`);

  // Add the main sitemap index
  sitemapFiles.unshift(`${BASE_URL}/sitemap.xml`);

  return sitemapFiles;
}

/**
 * Create IndexNow API key file in public directory
 */
function createApiKeyFile() {
  const publicDir = path.join(process.cwd(), 'public');
  const keyFilePath = path.join(publicDir, `${INDEXNOW_API_KEY}.txt`);

  if (!fs.existsSync(keyFilePath)) {
    fs.writeFileSync(keyFilePath, INDEXNOW_API_KEY);
    console.log(`✅ Created IndexNow API key file: ${INDEXNOW_API_KEY}.txt`);
  } else {
    console.log(`📄 IndexNow API key file already exists: ${INDEXNOW_API_KEY}.txt`);
  }
}

/**
 * Main notification function
 */
async function notifySearchEngines() {
  console.log('🚀 Starting search engine notification...');

  // Validate API key
  if (!INDEXNOW_API_KEY || INDEXNOW_API_KEY === 'your-api-key-here') {
    console.warn('⚠️  No valid INDEXNOW_API_KEY found. Skipping IndexNow submission.');
    console.log('   Set INDEXNOW_API_KEY environment variable or add to GitHub Secrets');
    console.log('   Generate a key at: https://www.bing.com/indexnow');
  } else {
    // Create API key file
    createApiKeyFile();
  }

  try {
    // Get all sitemap URLs
    const sitemapUrls = getSitemapUrls();
    console.log(`📋 Found ${sitemapUrls.length} sitemap URLs to submit`);

    // Submit to IndexNow (only first endpoint needed - it broadcasts to others)
    if (INDEXNOW_API_KEY && INDEXNOW_API_KEY !== 'your-api-key-here') {
      try {
        console.log('📤 Submitting to IndexNow (Bing, Yandex, Seznam)...');
        const result = await submitToIndexNow(sitemapUrls);
        console.log(`✅ IndexNow submission successful (${result.statusCode})`);
        console.log(`   Host: ${result.host}`);
      } catch (error) {
        console.error('❌ IndexNow submission failed:', error.message);
      }
    }

    // Ping Google directly (they don't support IndexNow)
    try {
      console.log('📤 Pinging Google with sitemap location...');
      await pingGoogle(`${BASE_URL}/sitemap.xml`);
      console.log('✅ Google sitemap ping successful');
    } catch (error) {
      console.error('❌ Google ping failed:', error.message);
      console.log('   Google will still discover updates during regular crawls');
    }

    console.log('🎉 Search engine notification complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Total sitemaps: ${sitemapUrls.length}`);
    console.log(`   - IndexNow: ${INDEXNOW_API_KEY !== 'your-api-key-here' ? 'Submitted' : 'Skipped (no API key)'}`);
    console.log(`   - Google: Pinged`);
    console.log('');
    console.log('⏱️  Expected impact:');
    console.log('   - Bing/Yandex: Within 24 hours');
    console.log('   - Google: Within 1-3 days');

  } catch (error) {
    console.error('❌ Error notifying search engines:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  notifySearchEngines();
}

export { notifySearchEngines, submitToIndexNow, pingGoogle };
