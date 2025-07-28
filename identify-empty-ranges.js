#!/usr/bin/env node

// Script to identify empty ID ranges and generate a configuration file
// This helps the sitemap API skip empty ranges immediately

const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

async function identifyEmptyRanges() {
  const client = await pool.connect();
  
  try {
    console.log('Identifying empty ID ranges...\n');
    
    // Focus on the problematic area around 2.8M
    const CHUNK_SIZE = 3000;
    const START_CHECK = 2500000;
    const END_CHECK = 10000000;
    
    const emptyRanges = [];
    const sparseRanges = [];
    const validRanges = [];
    
    console.log(`Checking ranges from ${START_CHECK.toLocaleString()} to ${END_CHECK.toLocaleString()}...`);
    
    // Check each 3000-ID chunk
    for (let start = START_CHECK; start < END_CHECK; start += CHUNK_SIZE) {
      const end = start + CHUNK_SIZE - 1;
      
      // Quick count query
      const query = `
        SELECT COUNT(*) as count
        FROM part_info
        WHERE id >= $1 AND id <= $2
        AND nsn IS NOT NULL AND nsn != ''
      `;
      
      const result = await client.query(query, [start, end]);
      const count = parseInt(result.rows[0].count);
      
      if (count === 0) {
        emptyRanges.push({ start, end });
      } else if (count < 10) {
        sparseRanges.push({ start, end, count });
      } else {
        validRanges.push({ start, end, count });
      }
      
      // Progress update
      if ((start - START_CHECK) % 300000 === 0) {
        console.log(`Progress: ${((start - START_CHECK) / (END_CHECK - START_CHECK) * 100).toFixed(1)}%`);
      }
    }
    
    console.log(`\nAnalysis complete:`);
    console.log(`- Empty ranges: ${emptyRanges.length}`);
    console.log(`- Sparse ranges (< 10 parts): ${sparseRanges.length}`);
    console.log(`- Valid ranges: ${validRanges.length}`);
    
    // Consolidate consecutive empty ranges
    const consolidatedEmpty = [];
    let currentRange = null;
    
    for (const range of emptyRanges) {
      if (!currentRange) {
        currentRange = { start: range.start, end: range.end };
      } else if (range.start === currentRange.end + 1) {
        currentRange.end = range.end;
      } else {
        consolidatedEmpty.push(currentRange);
        currentRange = { start: range.start, end: range.end };
      }
    }
    if (currentRange) {
      consolidatedEmpty.push(currentRange);
    }
    
    console.log(`\nConsolidated to ${consolidatedEmpty.length} empty ranges`);
    
    // Generate configuration file
    const config = {
      generated: new Date().toISOString(),
      emptyRanges: consolidatedEmpty,
      sparseRanges: sparseRanges,
      stats: {
        totalEmpty: emptyRanges.length,
        totalSparse: sparseRanges.length,
        totalValid: validRanges.length,
        checkedFrom: START_CHECK,
        checkedTo: END_CHECK
      }
    };
    
    fs.writeFileSync('empty-ranges-config.json', JSON.stringify(config, null, 2));
    console.log('\nConfiguration saved to empty-ranges-config.json');
    
    // Generate TypeScript constant for the API
    const tsContent = `// Auto-generated empty ranges configuration
// Generated: ${new Date().toISOString()}

export const KNOWN_EMPTY_RANGES = ${JSON.stringify(consolidatedEmpty, null, 2)};

export const SPARSE_RANGES = ${JSON.stringify(
      sparseRanges.filter(r => r.count < 5).map(r => ({ start: r.start, end: r.end })), 
      null, 
      2
    )};
`;
    
    fs.writeFileSync('src/app/api/sitemap-parts/empty-ranges.ts', tsContent);
    console.log('TypeScript configuration saved to src/app/api/sitemap-parts/empty-ranges.ts');
    
    // Show sample of findings
    console.log('\nSample empty ranges:');
    consolidatedEmpty.slice(0, 5).forEach(range => {
      console.log(`  ${range.start.toLocaleString()} - ${range.end.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

identifyEmptyRanges().catch(console.error);