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
  max: 3,
  min: 1,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 60000,
  acquireTimeoutMillis: 30000,
  statement_timeout: 120000, // 2 minutes for sitemap generation
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
  // NSNs are already formatted with hyphens in the database (e.g., "3010-01-172-3064")
  // Just return as-is after trimming any whitespace
  return nsn ? nsn.trim() : nsn;
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
  const batchSize = 2000; // Keep consistent with existing GSC submissions
  
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
    // Skip expensive COUNT query - generate sitemaps until we run out of data
    console.log('📊 Generating sitemaps incrementally (no upfront count)');
    
    // Generate sitemap index - we'll populate this as we create files
    const sitemapIndexUrls = [];
    const lastmod = new Date().toISOString();
    
    let batchIndex = 0;
    let hasMoreData = true;
    
    // Generate individual sitemap files
    while (hasMoreData) {
      const startRange = batchIndex * batchSize + 1;
      const endRange = (batchIndex + 1) * batchSize;
      const offset = batchIndex * batchSize;
      
      console.log(`📄 Generating sitemap batch ${batchIndex + 1} (offset ${offset})`);
      
      const query = `
        SELECT 
          pi.fsg,
          pi.fsc,
          fsgs.fsg_title,
          fsgs.fsc_title,
          pi.nsn
        FROM part_info pi
        LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
        WHERE pi.nsn IS NOT NULL 
          AND pi.fsg IS NOT NULL 
          AND pi.fsc IS NOT NULL
          AND LENGTH(TRIM(pi.nsn)) = 16
        ORDER BY pi.nsn
        LIMIT $1 OFFSET $2
      `;
      
      // Set aggressive timeout for this specific query
      const client = await pool.connect();
      
      try {
        await client.query('SET statement_timeout = 120000'); // 2 minutes
        const result = await client.query(query, [batchSize, offset]);
        const parts = result.rows;
        
        if (parts.length > 0) {
          // Filter out parts without valid titles, provide defaults if needed
          const validParts = parts.map(part => ({
            ...part,
            fsg_title: part.fsg_title || `Group ${part.fsg}`,
            fsc_title: part.fsc_title || `Subgroup ${part.fsc}`
          }));
          
          const sitemap = generateSiteMap(validParts);
          const filename = `sitemap-${startRange}-${endRange}.xml`;
          fs.writeFileSync(path.join(publicDir, filename), sitemap);
          
          // Add to sitemap index
          sitemapIndexUrls.push(`https://skywardparts.com/${filename}`);
          
          console.log(`   ✅ Generated ${filename} with ${parts.length} parts (${validParts.length} valid)`);
          
          // If we got fewer parts than requested, we've reached the end
          if (parts.length < batchSize) {
            hasMoreData = false;
          }
        } else {
          // No more data
          hasMoreData = false;
          console.log(`   📭 No more data - stopping at batch ${batchIndex + 1}`);
        }
      } finally {
        client.release();
      }
      
      batchIndex++;
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log(`📊 Generated ${sitemapIndexUrls.length} sitemap files`);
    
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