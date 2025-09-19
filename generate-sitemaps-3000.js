#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production env if in production, otherwise default .env
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, envFile) });

const { Pool } = pg;

// Database configuration
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const PARTS_PER_SITEMAP = 3000;
const DOMAIN = 'https://skywardindustries.com';
const SITEMAP_DIR = path.join(__dirname, 'public', 'sitemap');

// Ensure sitemap directory exists
if (!fs.existsSync(SITEMAP_DIR)) {
  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
}

function generateSitemapXML(parts) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const part of parts) {
    const nsn = part.nsn.replace(/\s+/g, '-');
    const groupName = (part.group_name || 'uncategorized').toLowerCase().replace(/\s+/g, '-');
    const subgroupName = (part.subgroup_name || 'uncategorized').toLowerCase().replace(/\s+/g, '-');

    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}/catalog/${part.group_id}/${groupName}/${part.subgroup_id}/${subgroupName}/nsn-${nsn}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

async function generateSitemaps() {
  console.log('🚀 Starting sitemap generation with 3000 parts per file...');
  console.log(`📁 Output directory: ${SITEMAP_DIR}`);

  try {
    // Get total count of parts
    const countResult = await pool.query('SELECT COUNT(*) FROM parts WHERE nsn IS NOT NULL');
    const totalParts = parseInt(countResult.rows[0].count);
    console.log(`📊 Total parts in database: ${totalParts.toLocaleString()}`);

    const totalSitemaps = Math.ceil(totalParts / PARTS_PER_SITEMAP);
    console.log(`📝 Will generate ${totalSitemaps} sitemap files`);

    const sitemapFiles = [];

    // Generate individual sitemap files
    for (let i = 0; i < totalSitemaps; i++) {
      const offset = i * PARTS_PER_SITEMAP;
      const startNum = offset + 1;
      const endNum = Math.min(offset + PARTS_PER_SITEMAP, totalParts);

      // Query parts for this sitemap
      const query = `
        SELECT
          p.nsn,
          p.part_number,
          p.part_name,
          g.id as group_id,
          g.name as group_name,
          sg.id as subgroup_id,
          sg.name as subgroup_name
        FROM parts p
        LEFT JOIN subgroups sg ON p.subgroup = sg.id
        LEFT JOIN groups g ON sg.group_id = g.id
        WHERE p.nsn IS NOT NULL
        ORDER BY p.nsn
        LIMIT $1 OFFSET $2
      `;

      console.log(`⚙️  Generating sitemap ${i + 1}/${totalSitemaps}: parts ${startNum}-${endNum}`);

      const result = await pool.query(query, [PARTS_PER_SITEMAP, offset]);

      if (result.rows.length > 0) {
        const filename = `${startNum}/${endNum}.xml`;
        const filepath = path.join(SITEMAP_DIR, `${startNum}`);

        // Create directory if it doesn't exist
        if (!fs.existsSync(filepath)) {
          fs.mkdirSync(filepath, { recursive: true });
        }

        const fullPath = path.join(filepath, `${endNum}.xml`);
        const xml = generateSitemapXML(result.rows);

        fs.writeFileSync(fullPath, xml);
        console.log(`✅ Written: ${filename} (${result.rows.length} parts)`);

        sitemapFiles.push({
          loc: `${DOMAIN}/sitemap/${filename}`,
          lastmod: new Date().toISOString()
        });
      }
    }

    // Generate sitemap index
    console.log('\n📋 Generating sitemap index...');
    let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const sitemap of sitemapFiles) {
      indexXml += '  <sitemap>\n';
      indexXml += `    <loc>${sitemap.loc}</loc>\n`;
      indexXml += `    <lastmod>${sitemap.lastmod.split('T')[0]}</lastmod>\n`;
      indexXml += '  </sitemap>\n';
    }

    indexXml += '</sitemapindex>';

    const indexPath = path.join(__dirname, 'public', 'sitemap_index.xml');
    fs.writeFileSync(indexPath, indexXml);
    console.log(`✅ Sitemap index written to: ${indexPath}`);

    // Summary
    console.log('\n🎉 Sitemap generation complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Total parts: ${totalParts.toLocaleString()}`);
    console.log(`   - Sitemap files: ${sitemapFiles.length}`);
    console.log(`   - Parts per file: ${PARTS_PER_SITEMAP}`);
    console.log(`   - Output directory: ${SITEMAP_DIR}`);

    // Update robots.txt reminder
    console.log('\n📌 Remember to ensure your robots.txt includes:');
    console.log(`   Sitemap: ${DOMAIN}/sitemap_index.xml`);

  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
generateSitemaps().catch(console.error);