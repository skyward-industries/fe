#!/usr/bin/env node

import fs from 'fs';

const emergencyFix = `// File: /home/ec2-user/fe/src/lib/db.js
// This file sets up the PostgreSQL database connection and data fetching functions using ES Modules for Next.js.

import 'server-only'; // Keep this directive for Next.js server-side code
import { Pool } from 'pg'; // Use ES Module import
import { NextResponse } from 'next/server';

// -----------------------------------------------------------------------------
// PostgreSQL Connection Pool Setup
// -----------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';
const isRds = (process.env.PGHOST || '').includes('amazonaws.com');

const pool = new Pool({
  // Use process.env directly (variables are loaded by Next.js/Vercel environment)
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isRds ? { rejectUnauthorized: false } : (isProduction ? { rejectUnauthorized: false } : false),
  max: 20, // Reduced from 50 to 20 - avoid overwhelming database
  min: 2, // Keep minimum connections
  idleTimeoutMillis: 30000, // Reduced to 30 seconds - release connections faster
  connectionTimeoutMillis: 5000, // Reduced to 5 seconds - fail fast on connection issues
  acquireTimeoutMillis: 10000, // Max 10 seconds to acquire connection from pool
  // Add connection reuse settings
  allowExitOnIdle: false, // Don't exit when idle
  // Add connection validation
  maxUses: 5000, // Reduced max uses per connection
  // Add statement timeout to prevent queries from running forever
  statement_timeout: 10000, // Reduced to 10 seconds max per query
});

pool.on('connect', () => {
  console.log('[FE DB] PostgreSQL client connected successfully!');
});

pool.on('error', (err) => {
  console.error('[FE DB] Unexpected error on idle client', err);
  // Don't exit the process, just log the error
});

pool.on('acquire', () => {
  console.log('[FE DB] Client acquired from pool');
});

pool.on('release', () => {
  console.log('[FE DB] Client released back to pool');
});

// Monitor pool status
const poolCheckInterval = setInterval(() => {
  console.log(\`[FE DB Pool] Total: \${pool.totalCount}, Idle: \${pool.idleCount}, Waiting: \${pool.waitingCount}\`);
}, 30000); // Log every 30 seconds

// Clean up on exit
process.on('SIGINT', () => {
  clearInterval(poolCheckInterval);
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  clearInterval(poolCheckInterval);
  pool.end();
  process.exit(0);
});

// -----------------------------------------------------------------------------
// In-memory cache to avoid repeated database queries under high load
// -----------------------------------------------------------------------------
const partInfoCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 10000; // Max 10k cached entries

function getCacheKey(nsn) {
  return \`partinfo:\${nsn}\`;
}

function getCachedPartInfo(nsn) {
  const key = getCacheKey(nsn);
  const cached = partInfoCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(\`[FE DB Cache] Cache HIT for NSN: \${nsn}\`);
    return cached.data;
  }
  
  // Remove expired entry
  if (cached) {
    partInfoCache.delete(key);
  }
  
  return null;
}

function setCachedPartInfo(nsn, data) {
  // Implement LRU cache - remove oldest entries when cache is full
  if (partInfoCache.size >= MAX_CACHE_SIZE) {
    const firstKey = partInfoCache.keys().next().value;
    partInfoCache.delete(firstKey);
  }
  
  const key = getCacheKey(nsn);
  partInfoCache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  
  console.log(\`[FE DB Cache] Cached NSN: \${nsn} (cache size: \${partInfoCache.size})\`);
}


// -----------------------------------------------------------------------------
// Database Query Functions (Defined using standard async function syntax)
// -----------------------------------------------------------------------------

/**
 * Fetches detailed part information from the database based on NSN.
 * EMERGENCY FIX: Simplified query to prevent timeouts
 */
async function getPartsByNSN(nsn) {
  // Check cache first to avoid database load
  const cachedResult = getCachedPartInfo(nsn);
  if (cachedResult) {
    return cachedResult;
  }
  
  // EMERGENCY SIMPLIFIED QUERY - Split into two fast queries instead of one slow query
  const basicQuery = \`
    SELECT
      pi.nsn, pi.fsg, pi.fsc, pi.niin,
      fsgs.fsg_title, fsgs.fsc_title
    FROM public.part_info pi
    LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
    WHERE REPLACE(pi.nsn, '-', '') = $1
    LIMIT 1;
  \`;
  
  let client;
  try {
    // Use timeout to avoid hanging on connection acquisition during high load
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection acquisition timeout')), 5000)
      )
    ]);
    
    console.log(\`[FE DB Query] Executing EMERGENCY SIMPLIFIED getPartsByNSN for NSN: \${nsn}\`);
    const startTime = Date.now();
    
    // Set aggressive query timeout
    await client.query('SET statement_timeout = 3000'); // 3 second max
    
    // First get basic part info
    const basicResult = await client.query(basicQuery, [nsn]);
    
    if (basicResult.rows.length === 0) {
      // Cache empty result to avoid repeated queries
      setCachedPartInfo(nsn, []);
      return [];
    }
    
    const basicPart = basicResult.rows[0];
    
    // Then get additional details with separate queries (can fail gracefully)
    let partNumbers = [];
    let addresses = [];
    
    try {
      // Get part numbers separately
      const pnResult = await client.query(
        'SELECT part_number, cage_code FROM public.part_numbers WHERE nsn = $1 LIMIT 10',
        [basicPart.nsn]
      );
      partNumbers = pnResult.rows;
    } catch (err) {
      console.warn(\`[FE DB Query] Failed to fetch part numbers: \${err.message}\`);
    }
    
    // Combine results
    const results = partNumbers.length > 0 
      ? partNumbers.map(pn => ({
          ...basicPart,
          part_number: pn.part_number,
          cage_code: pn.cage_code,
          // Add empty fields for compatibility
          company_name: null,
          street_address_1: null,
          city: null,
          state: null,
          zip: null,
          country: null,
          unit_of_issue: null,
          aac: null,
          sos: null,
          sosm: null,
        }))
      : [{
          ...basicPart,
          part_number: null,
          cage_code: null,
          company_name: null,
          street_address_1: null,
          city: null,
          state: null,
          zip: null,
          country: null,
          unit_of_issue: null,
          aac: null,
          sos: null,
          sosm: null,
        }];
    
    const queryTime = Date.now() - startTime;
    console.log(\`[FE DB Query] getPartsByNSN found \${results.length} record(s) in \${queryTime}ms.\`);
    
    // Cache the result
    setCachedPartInfo(nsn, results);
    
    return results;
   } catch (error) {
     console.error(\`[FE DB Query] Error in getPartsByNSN for \${nsn}:\`, error.message);
     
     // Return cached data if available, even if expired, as fallback
     const expiredCache = partInfoCache.get(getCacheKey(nsn));
     if (expiredCache) {
       console.log(\`[FE DB Query] Returning expired cache for \${nsn} due to error\`);
       return expiredCache.data;
     }
     
     throw new Error('FE: Failed to fetch part data from the database.');
   } finally {
     if (client) {
       client.release();
     }
   }
}

/**
 * Fetches additional metadata for a part (item names, characteristics) - OPTIONAL and slower
 * This data is fetched separately to avoid blocking the main partInfo query
 */
async function getPartAdditionalData(nsn, niin) {
  try {
    const client = await pool.connect();
    console.log(\`[FE DB Query] Fetching additional data for NSN: \${nsn}\`);
    
    // Fetch the expensive data separately with timeout protection
    const additionalQuery = \`
      SELECT 
        (SELECT item_name FROM public.nsn_with_inc WHERE nsn = $1 LIMIT 1) AS item_name,
        (SELECT end_item_name FROM public.nsn_with_inc WHERE nsn = $1 LIMIT 1) AS end_item_name,
        (SELECT mrc FROM public.char_data WHERE niin = $2 LIMIT 1) AS mrc,
        (SELECT requirements_statement FROM public.char_data WHERE niin = $2 LIMIT 1) AS requirements_statement,
        (SELECT clear_text_reply FROM public.char_data WHERE niin = $2 LIMIT 1) AS clear_text_reply
    \`;
    
    // Set a shorter timeout for this optional data
    await client.query('SET statement_timeout = 5000'); // 5 second timeout
    
    const startTime = Date.now();
    const result = await client.query(additionalQuery, [nsn, niin]);
    const queryTime = Date.now() - startTime;
    
    client.release();
    console.log(\`[FE DB Query] Additional data fetched in \${queryTime}ms\`);
    
    return result.rows[0] || {};
  } catch (error) {
    console.warn(\`[FE DB Query] Additional data fetch failed for NSN \${nsn}:\`, error.message);
    // Return empty object instead of throwing - this data is optional
    return {
      item_name: null,
      end_item_name: null,
      mrc: null,
      requirements_statement: null,
      clear_text_reply: null
    };
  }
}

/**
 * Fetches only the main, distinct product groups (FSGs) from the database.
 * Used by the FE Next.js app.
 */
async function getGroups() {
  // ... (Your existing query and logic using 'pool') ...
   const query = \`
    SELECT
      fsg,
      fsg_title,
      -- Use an aggregate function like MAX() to select one representative description
      -- for each group, ensuring that GROUP BY returns a single, unique row per FSG.
      -- Assuming a description column named 'fsg_notes'. Change if your column name is different.
      MAX(fsg_notes) AS description
    FROM public.wp_fsgs_new
    -- Filter out any entries that lack a proper title for cleaner data.
    WHERE fsg_title IS NOT NULL AND fsg_title <> ''
    -- Group by the unique identifier (fsg) and its title.
    GROUP BY fsg, fsg_title
    -- Order the results for a consistent and predictable display.
    ORDER BY fsg ASC;
  \`;
   try {
      const client = await pool.connect();
      console.log('[FE DB Query] Executing getGroups.');
      const result = await client.query(query);
      client.release();
      console.log(\`[FE DB Query] getGroups found \${result.rows.length} unique group(s).\`);
      return result.rows;
   } catch (error) {
      console.error('[FE DB Query] Error in getGroups:', error);
      throw new Error('FE: Failed to fetch product groups from database.');
   }
}

/**
 * Fetches all subgroups (FSCs) for a specific main group (FSG).
 * Used by the FE Next.js app.
 */
async function getSubgroupsByGroup(fsg) {
  // ... (Your existing query and logic using 'pool') ...
   const query = \`
    SELECT
      fsc,
      fsc_title,
      fsc_notes AS description
    FROM public.wp_fsgs_new
    WHERE fsg = $1
      AND fsc_title IS NOT NULL AND fsc_title <> ''
    ORDER BY fsc ASC;
  \`;
   try {
      const client = await pool.connect();
      console.log(\`[FE DB Query] Executing getSubgroupsByGroup for FSG: \${fsg}\`);
      const result = await client.query(query, [fsg]);
      client.release();
      console.log(\`[FE DB Query] getSubgroupsByGroup found \${result.rows.length} subgroup(s).\`);
      return result.rows;
   } catch (error) {
      console.error(\`[FE DB Query] Error in getSubgroupsByGroup for FSG \${fsg}:\`, error);
      throw new Error('FE: Failed to fetch subgroup data from the database.');
   }
}

// --- ES Module NAMED Exports ---
// Export the pool and the functions as NAMED exports
export {
    pool, // Export the pool instance
    getPartsByNSN, // Export the functions
    getPartAdditionalData, // Export the new optional additional data function
    getGroups,
    getSubgroupsByGroup
    // Add other functions from your original db.js if needed
};

// REMOVE ANY 'export default ...' line from this file if it exists
`;

// Write the emergency fix
fs.writeFileSync('emergency-db-fix.js', emergencyFix);
console.log('✅ Created emergency-db-fix.js');
console.log('\nTo apply the fix:');
console.log('1. cp src/lib/db.js src/lib/db.js.backup');
console.log('2. cp emergency-db-fix.js src/lib/db.js');
console.log('3. pm2 restart skyward-prod');