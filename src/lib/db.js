// File: /home/ec2-user/fe/src/lib/db.js
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
  max: 50, // Increased from 10 to 50 to handle 37+ sessions
  idleTimeoutMillis: 60000, // Increased to 60 seconds to keep connections longer
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for connection timeout
  // Add connection reuse settings
  allowExitOnIdle: false, // Don't exit when idle
  // Add connection validation
  maxUses: 7500,
  // Add statement timeout to prevent queries from running forever
  statement_timeout: 30000, // 30 seconds max per query
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
  console.log(`[FE DB Pool] Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
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
// Database Query Functions (Defined using standard async function syntax)
// -----------------------------------------------------------------------------

/**
 * Fetches detailed part information from the database based on NSN.
 * Used by the FE Next.js app for its own data needs.
 */
async function getPartsByNSN(nsn) {
  // ... (Your existing query and logic using 'pool') ...
  const query = `
    SELECT
      pi.nsn, pi.fsg, pi.fsc,
      fsgs.fsg_title, fsgs.fsc_title,
      pn.part_number, pn.cage_code,
      addr.company_name, addr.company_name_2, addr.company_name_3, addr.company_name_4, addr.company_name_5,
      addr.street_address_1, addr.street_address_2, addr.po_box, addr.city, addr.state, addr.zip, addr.country,
      addr.date_est, addr.last_update, addr.former_name_1, addr.former_name_2, addr.former_name_3, addr.former_name_4, addr.frn_dom,
      vfm.moe_rule AS moe_rule_vfm, vfm.aac, vfm.sos, vfm.sosm, vfm.unit_of_issue, vfm.controlled_inventory_code,
      vfm.shelf_life_code, vfm.replenishment_code, vfm.management_control_code, vfm.use_status_code,
      vfm.effective_date AS row_effective_date, vfm.row_observation_date AS row_obs_date_fm,
      fi.activity_code, fi.nmfc_number, fi.nmfc_subcode, fi.uniform_freight_class, fi.ltl_class,
      fi.wcc, fi.tcc, fi.shc, fi.adc, fi.acc, fi.nmf_desc AS nmfc_description,
      (SELECT item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS item_name,
      (SELECT end_item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS end_item_name,
      (SELECT mrc FROM public.char_data WHERE niin = pi.niin LIMIT 1) AS mrc,
      (SELECT requirements_statement FROM public.char_data WHERE niin = pi.niin LIMIT 1) AS requirements_statement,
      (SELECT clear_text_reply FROM public.char_data WHERE niin = pi.niin LIMIT 1) AS clear_text_reply
    FROM public.part_info pi
    LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
    LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
    LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
    LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
    LEFT JOIN public.freight_info fi ON pi.niin = fi.niin
    WHERE pi.nsn = $1;
  `;
   try {
    const client = await pool.connect();
    console.log(`[FE DB Query] Executing getPartsByNSN for NSN: ${nsn}`);
    const result = await client.query(query, [nsn]);
    client.release();
    console.log(`[FE DB Query] getPartsByNSN found ${result.rows.length} record(s).`);
    if (result.rows.length === 0) { return []; }
    return result.rows;
   } catch (error) {
     console.error('[FE DB Query] Error in getPartsByNSN:', error);
     throw new Error('FE: Failed to fetch part data from the database.');
   }
}

/**
 * Fetches only the main, distinct product groups (FSGs) from the database.
 * Used by the FE Next.js app.
 */
async function getGroups() {
  // ... (Your existing query and logic using 'pool') ...
   const query = `
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
  `;
   try {
      const client = await pool.connect();
      console.log('[FE DB Query] Executing getGroups.');
      const result = await client.query(query);
      client.release();
      console.log(`[FE DB Query] getGroups found ${result.rows.length} unique group(s).`);
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
   const query = `
    SELECT
      fsc,
      fsc_title,
      fsc_notes AS description
    FROM public.wp_fsgs_new
    WHERE fsg = $1
      AND fsc_title IS NOT NULL AND fsc_title <> ''
    ORDER BY fsc ASC;
  `;
   try {
      const client = await pool.connect();
      console.log(`[FE DB Query] Executing getSubgroupsByGroup for FSG: ${fsg}`);
      const result = await client.query(query, [fsg]);
      client.release();
      console.log(`[FE DB Query] getSubgroupsByGroup found ${result.rows.length} subgroup(s).`);
      return result.rows;
   } catch (error) {
      console.error(`[FE DB Query] Error in getSubgroupsByGroup for FSG ${fsg}:`, error);
      throw new Error('FE: Failed to fetch subgroup data from the database.');
   }
}

// --- ES Module NAMED Exports ---
// Export the pool and the functions as NAMED exports
export {
    pool, // Export the pool instance
    getPartsByNSN, // Export the functions
    getGroups,
    getSubgroupsByGroup
    // Add other functions from your original db.js if needed
};

// REMOVE ANY 'export default ...' line from this file if it exists