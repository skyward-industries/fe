#!/usr/bin/env node

/**
 * Safe Sitemap Regeneration Wrapper
 *
 * Provides pre-flight checks, validation, and rollback capabilities
 * for manual sitemap regeneration.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const BACKUP_DIR = path.join(process.cwd(), '.sitemap-backups');
const SITEMAP_SCRIPT = 'scripts/generate-static-sitemaps.js';

/**
 * Create backup of existing sitemaps
 */
async function backupSitemaps() {
  console.log('💾 Creating backup of existing sitemaps...');

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
  fs.mkdirSync(backupPath, { recursive: true });

  // Backup sitemap files
  const sitemapFiles = fs.readdirSync(PUBLIC_DIR)
    .filter(file => file.startsWith('sitemap') && file.endsWith('.xml'));

  if (sitemapFiles.length === 0) {
    console.log('   ⚠️  No existing sitemap files to backup');
    return null;
  }

  for (const file of sitemapFiles) {
    const sourcePath = path.join(PUBLIC_DIR, file);
    const destPath = path.join(backupPath, file);
    fs.copyFileSync(sourcePath, destPath);
  }

  console.log(`   ✅ Backed up ${sitemapFiles.length} files to ${backupPath}`);
  return backupPath;
}

/**
 * Restore from backup
 */
function restoreSitemaps(backupPath) {
  if (!backupPath || !fs.existsSync(backupPath)) {
    console.error('   ❌ Cannot restore: backup path invalid or not found');
    return false;
  }

  console.log('🔄 Restoring sitemaps from backup...');

  const backupFiles = fs.readdirSync(backupPath);

  for (const file of backupFiles) {
    const sourcePath = path.join(backupPath, file);
    const destPath = path.join(PUBLIC_DIR, file);
    fs.copyFileSync(sourcePath, destPath);
  }

  console.log(`   ✅ Restored ${backupFiles.length} files from backup`);
  return true;
}

/**
 * Pre-flight checks
 */
async function preFlightChecks() {
  console.log('🔍 Running pre-flight checks...\n');

  const checks = {
    passed: [],
    failed: [],
    warnings: []
  };

  // 1. Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion >= 18) {
    checks.passed.push(`Node.js version: ${nodeVersion}`);
  } else {
    checks.failed.push(`Node.js version too old: ${nodeVersion} (requires >= 18)`);
  }

  // 2. Check if script exists
  const scriptPath = path.join(process.cwd(), SITEMAP_SCRIPT);
  if (fs.existsSync(scriptPath)) {
    checks.passed.push('Sitemap generation script found');
  } else {
    checks.failed.push(`Script not found: ${SITEMAP_SCRIPT}`);
  }

  // 3. Check public directory
  if (fs.existsSync(PUBLIC_DIR)) {
    checks.passed.push('Public directory exists');
  } else {
    checks.warnings.push('Public directory does not exist (will be created)');
  }

  // 4. Check database credentials
  const requiredEnvVars = ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingEnvVars.length === 0) {
    checks.passed.push('Database credentials configured');
  } else {
    // Note: The script sets these internally, so this is a warning not an error
    checks.warnings.push(`Environment variables not set: ${missingEnvVars.join(', ')} (using script defaults)`);
  }

  // 5. Check disk space
  try {
    const { stdout } = await execAsync('df -h . | tail -1');
    const availableSpace = stdout.split(/\s+/)[3];
    checks.passed.push(`Disk space available: ${availableSpace}`);
  } catch (error) {
    checks.warnings.push('Could not check disk space');
  }

  // 6. Check write permissions
  try {
    const testFile = path.join(PUBLIC_DIR, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    checks.passed.push('Write permissions verified');
  } catch (error) {
    checks.failed.push('No write permission to public directory');
  }

  // Display results
  console.log('✅ Passed checks:');
  checks.passed.forEach(check => console.log(`   ✓ ${check}`));

  if (checks.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    checks.warnings.forEach(warning => console.log(`   ⚠ ${warning}`));
  }

  if (checks.failed.length > 0) {
    console.log('\n❌ Failed checks:');
    checks.failed.forEach(fail => console.log(`   ✗ ${fail}`));
  }

  console.log('');

  return checks.failed.length === 0;
}

/**
 * Post-generation validation
 */
function validateGeneration() {
  console.log('🔍 Validating generated sitemaps...');

  const validations = {
    passed: [],
    failed: []
  };

  // 1. Check sitemap index exists
  const sitemapIndexPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  if (fs.existsSync(sitemapIndexPath)) {
    validations.passed.push('Sitemap index created');

    // Validate XML structure
    const content = fs.readFileSync(sitemapIndexPath, 'utf8');
    if (content.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      validations.passed.push('Valid XML structure');
    } else {
      validations.failed.push('Invalid XML structure');
    }

    // Check for sitemap references
    const sitemapCount = (content.match(/<sitemap>/g) || []).length;
    if (sitemapCount > 0) {
      validations.passed.push(`Contains ${sitemapCount} sitemap references`);
    } else {
      validations.failed.push('No sitemap references found');
    }
  } else {
    validations.failed.push('Sitemap index not created');
  }

  // 2. Check individual sitemap files
  const sitemapFiles = fs.readdirSync(PUBLIC_DIR)
    .filter(file => file.startsWith('sitemap-') && file.endsWith('.xml'));

  if (sitemapFiles.length > 0) {
    validations.passed.push(`Generated ${sitemapFiles.length} sitemap files`);

    // Validate first file as sample
    const samplePath = path.join(PUBLIC_DIR, sitemapFiles[0]);
    const sampleContent = fs.readFileSync(samplePath, 'utf8');

    if (sampleContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      validations.passed.push('Sample sitemap has valid structure');
    } else {
      validations.failed.push('Sample sitemap has invalid structure');
    }

    const urlCount = (sampleContent.match(/<url>/g) || []).length;
    if (urlCount > 0) {
      validations.passed.push(`Sample sitemap contains ${urlCount} URLs`);
    } else {
      validations.failed.push('Sample sitemap contains no URLs');
    }
  } else {
    validations.failed.push('No individual sitemap files generated');
  }

  // Display results
  console.log('');
  validations.passed.forEach(msg => console.log(`   ✅ ${msg}`));

  if (validations.failed.length > 0) {
    console.log('');
    validations.failed.forEach(msg => console.log(`   ❌ ${msg}`));
  }

  console.log('');

  return validations.failed.length === 0;
}

/**
 * Clean up old backups (keep last 5)
 */
function cleanupOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return;
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(dir => dir.startsWith('backup-'))
    .sort()
    .reverse(); // Newest first

  const backupsToDelete = backups.slice(5); // Keep 5, delete rest

  if (backupsToDelete.length > 0) {
    console.log(`🧹 Cleaning up ${backupsToDelete.length} old backups...`);

    for (const backup of backupsToDelete) {
      const backupPath = path.join(BACKUP_DIR, backup);
      fs.rmSync(backupPath, { recursive: true, force: true });
    }

    console.log('   ✅ Cleanup complete');
  }
}

/**
 * Main regeneration function
 */
async function regenerateSitemapsSafe() {
  console.log('🚀 Safe Sitemap Regeneration');
  console.log('============================\n');

  let backupPath = null;

  try {
    // Step 1: Pre-flight checks
    const preFlightPassed = await preFlightChecks();

    if (!preFlightPassed) {
      console.error('❌ Pre-flight checks failed. Aborting.');
      process.exit(1);
    }

    // Step 2: Backup existing sitemaps
    backupPath = await backupSitemaps();
    console.log('');

    // Step 3: Run sitemap generation
    console.log('🔨 Generating sitemaps...');
    console.log('   This may take several minutes...\n');

    const { stdout, stderr } = await execAsync(`node ${SITEMAP_SCRIPT}`);

    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }

    console.log('');

    // Step 4: Validate generation
    const validationPassed = validateGeneration();

    if (!validationPassed) {
      console.error('❌ Validation failed. Rolling back...\n');
      if (backupPath) {
        restoreSitemaps(backupPath);
      }
      process.exit(1);
    }

    // Step 5: Success
    console.log('✅ Sitemap regeneration successful!');
    console.log('');

    // Step 6: Cleanup
    cleanupOldBackups();

    // Step 7: Next steps
    console.log('📋 Next steps:');
    console.log('   1. Review the generated sitemaps in public/');
    console.log('   2. Run `node scripts/notify-search-engines.js` to notify search engines');
    console.log('   3. Commit changes to git if satisfied');
    console.log('   4. Monitor crawl rates in Google Search Console');
    console.log('');

  } catch (error) {
    console.error('❌ Error during sitemap regeneration:', error);
    console.error('');

    if (backupPath) {
      console.log('🔄 Attempting rollback...');
      restoreSitemaps(backupPath);
    }

    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  regenerateSitemapsSafe();
}

export { regenerateSitemapsSafe, preFlightChecks, validateGeneration };
