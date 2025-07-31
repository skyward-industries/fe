#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const { Pool } = pg;

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
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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
  
  try {
    // Get total count of parts
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM part_info pi
      JOIN fsg_mapping fm ON pi.fsg = fm.fsg 
      JOIN fsc_mapping fc ON pi.fsc = fc.fsc
      WHERE pi.nsn IS NOT NULL 
        AND pi.fsg IS NOT NULL 
        AND pi.fsc IS NOT NULL
        AND fm.fsg_title IS NOT NULL 
        AND fc.fsc_title IS NOT NULL
    `;
    
    const countResult = await pool.query(countQuery);
    const totalParts = parseInt(countResult.rows[0].total);
    const totalBatches = Math.ceil(totalParts / batchSize);
    
    console.log(`📊 Total parts: ${totalParts.toLocaleString()}`);
    console.log(`📦 Total batches: ${totalBatches.toLocaleString()}`);
    
    // Generate sitemap index
    const sitemapIndexUrls = [];
    for (let i = 0; i < totalBatches; i++) {
      const startRange = i * batchSize + 1;
      const endRange = Math.min((i + 1) * batchSize, totalParts);
      sitemapIndexUrls.push(`https://skywardparts.com/sitemap/${startRange}/${endRange}.xml`);
    }
    
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexUrls.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
    console.log('✅ Generated sitemap index');
    
    // Generate individual sitemap files
    for (let i = 0; i < totalBatches; i++) {
      const startRange = i * batchSize + 1;
      const endRange = Math.min((i + 1) * batchSize, totalParts);
      const offset = startRange - 1;
      
      console.log(`📄 Generating sitemap ${i + 1}/${totalBatches} (${startRange}-${endRange})`);
      
      const query = `
        SELECT 
          pi.fsg,
          pi.fsc,
          fm.fsg_title,
          fc.fsc_title,
          pi.nsn
        FROM part_info pi
        JOIN fsg_mapping fm ON pi.fsg = fm.fsg 
        JOIN fsc_mapping fc ON pi.fsc = fc.fsc
        WHERE pi.nsn IS NOT NULL 
          AND pi.fsg IS NOT NULL 
          AND pi.fsc IS NOT NULL
          AND fm.fsg_title IS NOT NULL 
          AND fc.fsc_title IS NOT NULL
        ORDER BY pi.nsn
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [batchSize, offset]);
      const parts = result.rows;
      
      if (parts.length > 0) {
        const sitemap = generateSiteMap(parts);
        const filename = `sitemap-${startRange}-${endRange}.xml`;
        fs.writeFileSync(path.join(publicDir, filename), sitemap);
        console.log(`   ✅ Generated ${filename} with ${parts.length} parts`);
      } else {
        console.log(`   📭 Skipped empty range ${startRange}-${endRange}`);
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 Static sitemap generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

generateStaticSitemaps();