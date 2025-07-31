#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Set database configuration directly from ecosystem.config.cjs values
// These are the exact values from your ecosystem file
process.env.NODE_ENV = 'production';
process.env.PGHOST = 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com';
process.env.PGPORT = '5432';
process.env.PGDATABASE = 'skyward';
process.env.PGUSER = 'postgres';
process.env.PGPASSWORD = 'Skyward_db_pw1234!';
process.env.PGSSLMODE = 'require';

console.log('✅ Set database environment variables from ecosystem config');

// Database configuration - match the same config as src/lib/db.js
const isProduction = process.env.NODE_ENV === 'production';
const isRds = (process.env.PGHOST || '').includes('amazonaws.com');

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isRds ? { rejectUnauthorized: false } : (isProduction ? { rejectUnauthorized: false } : false),
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  acquireTimeoutMillis: 10000,
  statement_timeout: 10000,
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
    .trim();
}

function formatNSN(nsn) {
  if (nsn && nsn.length === 13) {
    return `${nsn.slice(0, 4)}-${nsn.slice(4, 6)}-${nsn.slice(6, 9)}-${nsn.slice(9)}`;
  }
  return nsn;
}

function generateSiteMap(parts) {
  const baseUrl = "https://skywardparts.com";
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parts
  .filter((part) => part.fsg_title && part.fsc_title && part.nsn)
  .map((part) => {
    const fsgSlug = slugify(part.fsg_title);
    const fscSlug = slugify(part.fsc_title);
    const formattedNsn = formatNSN(part.nsn);
    
    return `  <url>
    <loc>${baseUrl}/catalog/${part.fsg}/${fsgSlug}/${part.fsc}/${fscSlug}/${formattedNsn}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;
}

async function generateStaticSitemaps() {
  const publicDir = path.join(process.cwd(), 'public');
  const batchSize = 2000;
  
  console.log('🚀 Starting static sitemap generation...');
  console.log('📋 Database config:', {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    hasPassword: !!process.env.PGPASSWORD,
    isProduction,
    isRds,
    sslConfig: isRds ? { rejectUnauthorized: false } : (isProduction ? { rejectUnauthorized: false } : false)
  });

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Created public directory');
  }
  
  try {
    // Get total count of parts using the correct table structure
    const countQuery = `
      SELECT COUNT(DISTINCT pi.nsn) as total 
      FROM part_info pi
      JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.nsn IS NOT NULL 
        AND pi.fsg IS NOT NULL 
        AND pi.fsc IS NOT NULL
        AND fsgs.fsg_title IS NOT NULL 
        AND fsgs.fsc_title IS NOT NULL
        AND LENGTH(TRIM(pi.nsn)) = 13
    `;
    
    const countResult = await pool.query(countQuery);
    const totalParts = parseInt(countResult.rows[0].total);
    const totalBatches = Math.ceil(totalParts / batchSize);
    
    console.log(`📊 Total parts: ${totalParts.toLocaleString()}`);
    console.log(`📦 Total batches: ${totalBatches.toLocaleString()}`);
    
    // Generate sitemap index - we'll populate this as we create files
    const sitemapIndexUrls = [];
    const lastmod = new Date().toISOString();
    
    // Generate individual sitemap files
    for (let i = 0; i < totalBatches; i++) {
      const startRange = i * batchSize + 1;
      const endRange = Math.min((i + 1) * batchSize, totalParts);
      const offset = startRange - 1;
      
      console.log(`📄 Generating sitemap ${i + 1}/${totalBatches} (${startRange}-${endRange})`);
      
      const query = `
        SELECT DISTINCT
          pi.fsg,
          pi.fsc,
          fsgs.fsg_title,
          fsgs.fsc_title,
          pi.nsn
        FROM part_info pi
        JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
        WHERE pi.nsn IS NOT NULL 
          AND pi.fsg IS NOT NULL 
          AND pi.fsc IS NOT NULL
          AND fsgs.fsg_title IS NOT NULL 
          AND fsgs.fsc_title IS NOT NULL
          AND LENGTH(TRIM(pi.nsn)) = 13
        ORDER BY pi.nsn
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [batchSize, offset]);
      const parts = result.rows;
      
      if (parts.length > 0) {
        const sitemap = generateSiteMap(parts);
        const filename = `sitemap-${startRange}-${endRange}.xml`;
        fs.writeFileSync(path.join(publicDir, filename), sitemap);
        
        // Add to sitemap index
        sitemapIndexUrls.push(`https://skywardparts.com/${filename}`);
        
        console.log(`   ✅ Generated ${filename} with ${parts.length} parts`);
      } else {
        console.log(`   📭 Skipped empty range ${startRange}-${endRange}`);
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Generate sitemap index file
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexUrls.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
    console.log(`✅ Generated sitemap index with ${sitemapIndexUrls.length} sitemap files`);
    
    console.log('🎉 Static sitemap generation complete!');
    console.log(`📊 Generated ${sitemapIndexUrls.length} sitemap files with ${totalParts.toLocaleString()} total parts`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    
    // Provide more specific error messages
    if (error.code === '28000') {
      console.error('   🔐 Database authentication failed - check credentials');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   🌐 Database host not found - check network/hostname');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   🚫 Database connection refused - check if database is running');
    } else if (error.code === '42P01') {
      console.error('   📋 Database table not found - check table names');
    }
    
    process.exit(1);
  } finally {
    try {
      await pool.end();
      console.log('🔌 Database connection pool closed');
    } catch (error) {
      console.warn('⚠️ Error closing database pool:', error.message);
    }
  }
}

// Handle process signals for graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await pool.end();
  } catch (error) {
    console.warn('⚠️ Error during shutdown:', error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await pool.end();
  } catch (error) {
    console.warn('⚠️ Error during shutdown:', error.message);
  }
  process.exit(0);
});

generateStaticSitemaps();