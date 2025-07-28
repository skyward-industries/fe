#!/usr/bin/env node

// Script to analyze which ID ranges actually contain valid parts
// This helps identify which sitemap ranges should be generated

const { Pool } = require('pg');
const fs = require('fs');

// Database configuration
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

const BATCH_SIZE = 3000;
const MAX_ID_TO_CHECK = 100000000; // Adjust based on your data

async function analyzeIdRanges() {
  const client = await pool.connect();
  
  try {
    console.log('Analyzing ID ranges in part_info table...\n');
    
    // First, get the actual min and max IDs
    const boundsQuery = `
      SELECT 
        MIN(id) as min_id, 
        MAX(id) as max_id,
        COUNT(*) as total_parts
      FROM part_info
      WHERE nsn IS NOT NULL AND nsn != ''
    `;
    
    const boundsResult = await client.query(boundsQuery);
    const { min_id, max_id, total_parts } = boundsResult.rows[0];
    
    console.log(`Total valid parts: ${total_parts.toLocaleString()}`);
    console.log(`ID range: ${min_id.toLocaleString()} - ${max_id.toLocaleString()}\n`);
    
    // Analyze distribution by chunks
    const chunkSize = 1000000; // 1M chunks for analysis
    const validRanges = [];
    const emptyRanges = [];
    
    console.log('Analyzing ID distribution by 1M chunks...\n');
    
    for (let startId = 0; startId <= max_id; startId += chunkSize) {
      const endId = startId + chunkSize - 1;
      
      const countQuery = `
        SELECT COUNT(*) as count
        FROM part_info pi
        WHERE pi.id >= $1 AND pi.id <= $2
        AND pi.nsn IS NOT NULL AND pi.nsn != ''
      `;
      
      const result = await client.query(countQuery, [startId, endId]);
      const count = parseInt(result.rows[0].count);
      
      if (count > 0) {
        validRanges.push({ startId, endId, count });
        console.log(`✓ Range ${startId.toLocaleString()}-${endId.toLocaleString()}: ${count.toLocaleString()} parts`);
      } else {
        emptyRanges.push({ startId, endId });
      }
    }
    
    console.log(`\nFound ${validRanges.length} ranges with data`);
    console.log(`Found ${emptyRanges.length} empty ranges\n`);
    
    // Now analyze the valid ranges in more detail for sitemap generation
    console.log('Generating sitemap ranges (3000 parts per sitemap)...\n');
    
    const sitemapRanges = [];
    
    for (const range of validRanges) {
      // Get the actual IDs in this range for precise sitemap generation
      const idsQuery = `
        SELECT id
        FROM part_info
        WHERE id >= $1 AND id <= $2
        AND nsn IS NOT NULL AND nsn != ''
        ORDER BY id
      `;
      
      const idsResult = await client.query(idsQuery, [range.startId, range.endId]);
      const ids = idsResult.rows.map(row => row.id);
      
      // Create sitemap ranges based on actual IDs
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batchIds = ids.slice(i, i + BATCH_SIZE);
        if (batchIds.length > 0) {
          sitemapRanges.push({
            startId: batchIds[0],
            endId: batchIds[batchIds.length - 1],
            count: batchIds.length,
            offset: batchIds[0] - 1
          });
        }
      }
    }
    
    console.log(`Generated ${sitemapRanges.length} sitemap ranges\n`);
    
    // Save results
    const results = {
      metadata: {
        generated: new Date().toISOString(),
        totalParts: total_parts,
        minId: min_id,
        maxId: max_id,
        sitemapCount: sitemapRanges.length
      },
      validRanges: validRanges,
      sitemapRanges: sitemapRanges.slice(0, 100), // First 100 for review
      emptyMillionRanges: emptyRanges.map(r => `${r.startId}-${r.endId}`)
    };
    
    fs.writeFileSync('valid-id-ranges.json', JSON.stringify(results, null, 2));
    console.log('Results saved to valid-id-ranges.json');
    
    // Generate sitemap index entries
    const sitemapIndexEntries = sitemapRanges.map(range => 
      `  <sitemap>\n    <loc>https://skywardparts.com/sitemap/${range.startId}/${range.endId}.xml</loc>\n  </sitemap>`
    ).join('\n');
    
    fs.writeFileSync('sitemap-index-entries.txt', sitemapIndexEntries);
    console.log('Sitemap index entries saved to sitemap-index-entries.txt');
    
  } catch (error) {
    console.error('Error analyzing ID ranges:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the analysis
analyzeIdRanges().catch(console.error);