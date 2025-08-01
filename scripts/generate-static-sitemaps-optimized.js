#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Set database configuration
process.env.NODE_ENV = 'production';
process.env.PGHOST = 'skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com';
process.env.PGPORT = '5432';
process.env.PGDATABASE = 'skyward';
process.env.PGUSER = 'postgres';
process.env.PGPASSWORD = 'Skyward_db_pw1234!';
process.env.PGSSLMODE = 'require';

console.log('✅ Set database environment variables from ecosystem config');

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
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function formatNSN(nsn) {
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
  const batchSize = 2000;
  
  console.log('🚀 Starting OPTIMIZED static sitemap generation...');
  console.log('📋 Using cursor-based pagination (no OFFSET)');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Created public directory');
  }
  
  const client = await pool.connect();
  
  try {
    // Generate sitemap index - we'll populate this as we create files
    const sitemapIndexUrls = [];
    const lastmod = new Date().toISOString();
    
    // Use a cursor for efficient large dataset processing
    console.log('📊 Creating database cursor...');
    
    await client.query('BEGIN');
    await client.query(`
      DECLARE sitemap_cursor CURSOR FOR
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
    `);
    
    let batchIndex = 0;
    let hasMoreData = true;
    
    while (hasMoreData) {
      const startRange = batchIndex * batchSize + 1;
      const endRange = (batchIndex + 1) * batchSize;
      
      console.log(`📄 Fetching batch ${batchIndex + 1} (${startRange}-${endRange})`);
      
      // Fetch next batch from cursor
      const result = await client.query(`FETCH ${batchSize} FROM sitemap_cursor`);
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
        
        console.log(`   ✅ Generated ${filename} with ${parts.length} parts`);
        
        // If we got fewer parts than requested, we've reached the end
        if (parts.length < batchSize) {
          hasMoreData = false;
        }
      } else {
        // No more data
        hasMoreData = false;
        console.log(`   📭 No more data - completed at batch ${batchIndex + 1}`);
      }
      
      batchIndex++;
      
      // Small delay to avoid file system stress
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Close cursor and commit
    await client.query('CLOSE sitemap_cursor');
    await client.query('COMMIT');
    
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
    
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('❌ Error during rollback:', rollbackError.message);
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection pool closed');
  }
}

generateStaticSitemaps();