#!/usr/bin/env node

/**
 * Sitemap Health Monitoring Script
 *
 * Checks sitemap freshness, validates structure, and monitors for issues.
 * Can be run locally or integrated into monitoring systems.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://skywardparts.com';
const MAX_STALENESS_HOURS = 48; // Alert if lastmod > 48 hours old
const ALERT_THRESHOLD_DAYS = 7; // Critical alert if > 7 days old

/**
 * Parse lastmod date from sitemap XML
 */
function getLastModDate(xmlContent) {
  const lastmodMatch = xmlContent.match(/<lastmod>([^<]+)<\/lastmod>/);
  if (!lastmodMatch) {
    return null;
  }
  return new Date(lastmodMatch[1]);
}

/**
 * Check sitemap freshness
 */
function checkSitemapFreshness() {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapIndexPath = path.join(publicDir, 'sitemap.xml');

  if (!fs.existsSync(sitemapIndexPath)) {
    return {
      status: 'error',
      message: 'Sitemap index not found',
      path: sitemapIndexPath
    };
  }

  const sitemapContent = fs.readFileSync(sitemapIndexPath, 'utf8');
  const lastModDate = getLastModDate(sitemapContent);

  if (!lastModDate) {
    return {
      status: 'error',
      message: 'Could not parse lastmod date from sitemap',
    };
  }

  const now = new Date();
  const ageHours = (now - lastModDate) / (1000 * 60 * 60);
  const ageDays = ageHours / 24;

  let status = 'healthy';
  let message = `Sitemap is fresh (${ageHours.toFixed(1)} hours old)`;

  if (ageDays > ALERT_THRESHOLD_DAYS) {
    status = 'critical';
    message = `⚠️ CRITICAL: Sitemap is ${ageDays.toFixed(1)} days old!`;
  } else if (ageHours > MAX_STALENESS_HOURS) {
    status = 'warning';
    message = `⚠️ WARNING: Sitemap is ${ageHours.toFixed(1)} hours old`;
  }

  return {
    status,
    message,
    lastModDate,
    ageHours: ageHours.toFixed(1),
    ageDays: ageDays.toFixed(1),
    threshold: MAX_STALENESS_HOURS,
  };
}

/**
 * Validate sitemap structure
 */
function validateSitemapStructure() {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapIndexPath = path.join(publicDir, 'sitemap.xml');
  const issues = [];

  // Check sitemap index exists
  if (!fs.existsSync(sitemapIndexPath)) {
    issues.push('Sitemap index (sitemap.xml) not found');
    return { valid: false, issues };
  }

  // Read and validate XML
  const sitemapContent = fs.readFileSync(sitemapIndexPath, 'utf8');

  // Basic XML validation
  if (!sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    issues.push('Missing XML declaration');
  }

  if (!sitemapContent.includes('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    issues.push('Invalid or missing sitemapindex element');
  }

  // Check for sitemap references
  const sitemapMatches = sitemapContent.match(/<sitemap>/g);
  if (!sitemapMatches || sitemapMatches.length === 0) {
    issues.push('No sitemap references found in index');
  } else {
    console.log(`   ✓ Found ${sitemapMatches.length} sitemap references`);
  }

  // Validate individual sitemap files exist
  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'));

  if (sitemapFiles.length === 0) {
    issues.push('No individual sitemap files found');
  } else {
    console.log(`   ✓ Found ${sitemapFiles.length} sitemap files`);

    // Sample check first few sitemaps
    for (let i = 0; i < Math.min(3, sitemapFiles.length); i++) {
      const filePath = path.join(publicDir, sitemapFiles[i]);
      const content = fs.readFileSync(filePath, 'utf8');

      if (!content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
        issues.push(`Invalid urlset in ${sitemapFiles[i]}`);
      }

      const urlMatches = content.match(/<url>/g);
      if (!urlMatches || urlMatches.length === 0) {
        issues.push(`No URLs found in ${sitemapFiles[i]}`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    sitemapCount: sitemapFiles.length
  };
}

/**
 * Check sitemap accessibility over HTTP
 */
async function checkSitemapAccessibility() {
  return new Promise((resolve) => {
    const url = `${BASE_URL}/sitemap.xml`;

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({
          accessible: true,
          statusCode: res.statusCode,
          url
        });
      } else {
        resolve({
          accessible: false,
          statusCode: res.statusCode,
          url,
          error: `Unexpected status code: ${res.statusCode}`
        });
      }
    }).on('error', (error) => {
      resolve({
        accessible: false,
        url,
        error: error.message
      });
    });
  });
}

/**
 * Get sitemap statistics
 */
function getSitemapStats() {
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapFiles = fs.readdirSync(publicDir)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'));

  let totalUrls = 0;
  let totalSize = 0;

  // Sample a few files to estimate total
  const sampleSize = Math.min(5, sitemapFiles.length);
  let sampleUrls = 0;
  let sampleFileSize = 0;

  for (let i = 0; i < sampleSize; i++) {
    const filePath = path.join(publicDir, sitemapFiles[i]);
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);

    const urlMatches = content.match(/<url>/g);
    if (urlMatches) {
      sampleUrls += urlMatches.length;
    }
    sampleFileSize += stats.size;
  }

  // Extrapolate from sample
  if (sampleSize > 0) {
    const avgUrlsPerFile = sampleUrls / sampleSize;
    const avgSizePerFile = sampleFileSize / sampleSize;

    totalUrls = Math.round(avgUrlsPerFile * sitemapFiles.length);
    totalSize = Math.round(avgSizePerFile * sitemapFiles.length);
  }

  return {
    fileCount: sitemapFiles.length,
    estimatedUrls: totalUrls,
    estimatedSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB'
  };
}

/**
 * Main monitoring function
 */
async function monitorSitemapHealth() {
  console.log('🏥 Sitemap Health Check');
  console.log('========================\n');

  // 1. Check freshness
  console.log('📅 Checking sitemap freshness...');
  const freshnessCheck = checkSitemapFreshness();

  if (freshnessCheck.status === 'healthy') {
    console.log(`   ✅ ${freshnessCheck.message}`);
  } else if (freshnessCheck.status === 'warning') {
    console.log(`   ⚠️  ${freshnessCheck.message}`);
  } else if (freshnessCheck.status === 'critical') {
    console.log(`   🚨 ${freshnessCheck.message}`);
  } else {
    console.log(`   ❌ ${freshnessCheck.message}`);
  }

  if (freshnessCheck.lastModDate) {
    console.log(`   Last updated: ${freshnessCheck.lastModDate.toISOString()}`);
    console.log(`   Age: ${freshnessCheck.ageHours} hours (${freshnessCheck.ageDays} days)`);
  }
  console.log('');

  // 2. Validate structure
  console.log('🔍 Validating sitemap structure...');
  const structureCheck = validateSitemapStructure();

  if (structureCheck.valid) {
    console.log('   ✅ Sitemap structure is valid');
  } else {
    console.log('   ❌ Sitemap structure has issues:');
    structureCheck.issues.forEach(issue => {
      console.log(`      - ${issue}`);
    });
  }
  console.log('');

  // 3. Check accessibility
  console.log('🌐 Checking sitemap accessibility...');
  const accessibilityCheck = await checkSitemapAccessibility();

  if (accessibilityCheck.accessible) {
    console.log(`   ✅ Sitemap is accessible (${accessibilityCheck.statusCode})`);
    console.log(`   URL: ${accessibilityCheck.url}`);
  } else {
    console.log(`   ❌ Sitemap is not accessible`);
    console.log(`   URL: ${accessibilityCheck.url}`);
    console.log(`   Error: ${accessibilityCheck.error || accessibilityCheck.statusCode}`);
  }
  console.log('');

  // 4. Get statistics
  console.log('📊 Sitemap statistics...');
  const stats = getSitemapStats();
  console.log(`   Files: ${stats.fileCount}`);
  console.log(`   Estimated URLs: ${stats.estimatedUrls.toLocaleString()}`);
  console.log(`   Estimated size: ${stats.estimatedSize}`);
  console.log('');

  // Summary
  console.log('📋 Summary');
  console.log('========================');

  const allHealthy = (
    freshnessCheck.status === 'healthy' &&
    structureCheck.valid &&
    accessibilityCheck.accessible
  );

  if (allHealthy) {
    console.log('✅ All checks passed - sitemap is healthy!');
    return 0; // Exit code 0 for success
  } else {
    console.log('⚠️  Some checks failed - see details above');

    if (freshnessCheck.status === 'critical') {
      console.log('');
      console.log('🚨 CRITICAL: Sitemap staleness detected!');
      console.log('   Action required: Run `npm run generate-sitemaps` to refresh');
      console.log('   Or wait for automated daily regeneration');
      return 2; // Exit code 2 for critical
    }

    return 1; // Exit code 1 for warnings
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorSitemapHealth().then(exitCode => {
    process.exit(exitCode);
  });
}

export { monitorSitemapHealth, checkSitemapFreshness, validateSitemapStructure };
