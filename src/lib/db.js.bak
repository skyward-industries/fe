// src/lib/db.js
// This file sets up the PostgreSQL database connection and data fetching functions.
import 'server-only'
import { Pool } from 'pg';

// -----------------------------------------------------------------------------
// PostgreSQL Connection Pool Setup
// -----------------------------------------------------------------------------
// ... (Your existing pool setup code remains unchanged)
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('PostgreSQL client connected successfully!');
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});


// -----------------------------------------------------------------------------
// Database Query Functions
// -----------------------------------------------------------------------------

/**
 * Fetches detailed part information from the database based on NSN.
 * ... (Your getPartsByNSN function remains unchanged)
 */
export async function getPartsByNSN(nsn) {
  // ... (No changes needed here)
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
    LEFT JOIN public.wp_fsgs fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
    LEFT JOIN public.freight_info fi ON pi.niin = fi.niin
    WHERE pi.nsn = $1;
  `;

  try {
    const client = await pool.connect();
    console.log(`[DB Query] Executing getPartsByNSN for NSN: ${nsn}`);
    const result = await client.query(query, [nsn]);
    client.release();
    console.log(`[DB Query] getPartsByNSN found ${result.rows.length} record(s).`);

    if (result.rows.length === 0) {
      return [];
    }
    return result.rows;
  } catch (error) {
    console.error('[DB Query] Error in getPartsByNSN:', error);
    throw new Error('Failed to fetch part data from the database. Please check DB connection and SQL query.');
  }
}

/**
 * Fetches only the main, distinct product groups (FSGs) from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of main group objects.
 */
export async function getGroups() {
  // --- MODIFIED QUERY ---
  // This query now ensures each Federal Supply Group (FSG) appears only once.
  const query = `
    SELECT
      fsg,
      fsg_title,
      -- Use an aggregate function like MAX() to select one representative description
      -- for each group, ensuring that GROUP BY returns a single, unique row per FSG.
      -- Assuming a description column named 'fsg_notes'. Change if your column name is different.
      MAX(fsg_notes) AS description
    FROM public.wp_fsgs
    -- Filter out any entries that lack a proper title for cleaner data.
    WHERE fsg_title IS NOT NULL AND fsg_title <> ''
    -- Group by the unique identifier (fsg) and its title.
    GROUP BY fsg, fsg_title
    -- Order the results for a consistent and predictable display.
    ORDER BY fsg ASC;
  `;

  try {
    const client = await pool.connect();
    console.log('[DB Query] Executing getGroups to fetch main product groups.');
    const result = await client.query(query);
    client.release();
    console.log(`[DB Query] getGroups found ${result.rows.length} unique group(s).`);
    return result.rows;
  } catch (error) {
    console.error('[DB Query] Error in getGroups:', error);
    throw new Error('Failed to fetch product groups from database.');
  }
}
// ... (keep all your existing code in db.js, including getPartsByNSN and getGroups)

/**
 * Fetches all subgroups (FSCs) for a specific main group (FSG).
 * @param {string} fsg - The Federal Supply Group code (e.g., '10').
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of subgroup objects.
 */
export async function getSubgroupsByGroup(fsg) {
  // This query gets all unique Federal Supply Classes (FSCs) for a given FSG.
  const query = `
    SELECT
      fsc,
      fsc_title,
      fsc_notes AS description
    FROM public.wp_fsgs
    WHERE fsg = $1
      AND fsc_title IS NOT NULL AND fsc_title <> ''
    ORDER BY fsc ASC;
  `;

  try {
    const client = await pool.connect();
    console.log(`[DB Query] Executing getSubgroupsByGroup for FSG: ${fsg}`);
    const result = await client.query(query, [fsg]);
    client.release();
    console.log(`[DB Query] getSubgroupsByGroup found ${result.rows.length} subgroup(s).`);
    return result.rows;
  } catch (error) {
    console.error(`[DB Query] Error in getSubgroupsByGroup for FSG ${fsg}:`, error);
    throw new Error('Failed to fetch subgroup data from the database.');
  }
}

/**
 * Fetches all unique NSNs and their names for a given subgroup (FSC).
 * @param {string} fsc - The Federal Supply Class code (e.g., '1005').
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product/NSN objects.
 */

// ... (Your exports remain the same)
export default pool;