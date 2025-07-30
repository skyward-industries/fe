import 'server-only';
import { pool } from './db.js';

/**
 * Enhanced function to fetch comprehensive part information including all related data
 */
export async function getEnhancedPartsByNSN(nsn) {
  const query = `
    WITH part_base AS (
      SELECT
        pi.nsn, pi.fsg, pi.fsc, pi.niin,
        fsgs.fsg_title, fsgs.fsc_title,
        pn.part_number, pn.cage_code,
        addr.company_name, addr.company_name_2, addr.company_name_3,
        addr.street_address_1, addr.street_address_2, addr.po_box, 
        addr.city, addr.state, addr.zip, addr.country,
        addr.date_est, addr.last_update, addr.frn_dom,
        vfm.moe_rule AS moe_rule_vfm, vfm.aac, vfm.sos, vfm.sosm, 
        vfm.unit_of_issue, vfm.controlled_inventory_code,
        vfm.shelf_life_code, vfm.replenishment_code, 
        vfm.management_control_code, vfm.use_status_code,
        vfm.effective_date AS row_effective_date, 
        vfm.row_observation_date AS row_obs_date_fm,
        fi.activity_code, fi.nmfc_number, fi.nmfc_subcode, 
        fi.uniform_freight_class, fi.ltl_class,
        fi.wcc, fi.tcc, fi.shc, fi.adc, fi.acc, 
        fi.nmf_desc AS nmfc_description,
        ni.inc, ni.item_name, ni.end_item_name, ni.sos as ni_sos,
        aid.ai_summary, aid.meta_description
      FROM public.part_info pi
      LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
      LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
      LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
      LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      LEFT JOIN public.freight_info fi ON pi.niin = fi.niin
      LEFT JOIN public.nsn_with_inc ni ON (
        pi.nsn = ni.nsn 
        OR CONCAT(SUBSTRING(pi.nsn, 1, 12), LPAD(SUBSTRING(pi.nsn, 13), 6, '0')) = ni.nsn
        OR pi.nsn = CONCAT(SUBSTRING(ni.nsn, 1, 12), LTRIM(SUBSTRING(ni.nsn, 13), '0'))
      )
      LEFT JOIN public.product_ai_descriptions aid ON pi.nsn = aid.nsn
      WHERE pi.nsn = $1
    ),
    -- Get all characteristics
    characteristics AS (
      SELECT 
        cd.niin,
        cd.mrc,
        cd.requirements_statement,
        cd.clear_text_reply
      FROM public.char_data cd
      WHERE cd.niin IN (SELECT niin FROM part_base)
      ORDER BY 
        CASE cd.mrc
          WHEN 'AGAV' THEN 1  -- End item first
          WHEN 'TEXT' THEN 2  -- Description second
          WHEN 'FEAT' THEN 3  -- Features third
          WHEN 'MATT' THEN 4  -- Material fourth
          ELSE 5
        END,
        cd.mrc
    ),
    -- Get related NSNs
    related_nsns AS (
      SELECT 
        rn.nsn,
        rn.related_nsn,
        ni2.item_name as related_item_name,
        pn2.part_number as related_part_number,
        pn2.cage_code as related_cage_code
      FROM public.related_nsns rn
      LEFT JOIN public.nsn_with_inc ni2 ON rn.related_nsn = ni2.nsn
      LEFT JOIN public.part_numbers pn2 ON rn.related_nsn = pn2.nsn
      WHERE rn.nsn = $1
      LIMIT 10
    ),
    -- Get INC details if available (try multiple NSN formats)
    inc_details AS (
      SELECT DISTINCT
        h6.inc,
        h6.inc_status,
        h6.fiig,
        h6.app_key,
        h6.concept_no,
        h6.definition as inc_definition
      FROM public.v_h6_name_inc h6
      WHERE h6.inc IN (
        SELECT DISTINCT inc_val FROM (
          SELECT ni.inc::text as inc_val
          FROM public.nsn_with_inc ni 
          WHERE ni.nsn = $1 
             OR ni.nsn = CONCAT(SUBSTRING($1, 1, 12), '0', SUBSTRING($1, 13))
             OR $1 = CONCAT(SUBSTRING(ni.nsn, 1, 12), SUBSTRING(ni.nsn, 14))
          AND ni.inc IS NOT NULL
          UNION
          SELECT LPAD(ni.inc::text, 5, '0') as inc_val
          FROM public.nsn_with_inc ni 
          WHERE ni.nsn = $1 
             OR ni.nsn = CONCAT(SUBSTRING($1, 1, 12), '0', SUBSTRING($1, 13))
             OR $1 = CONCAT(SUBSTRING(ni.nsn, 1, 12), SUBSTRING(ni.nsn, 14))
          AND ni.inc IS NOT NULL
        ) inc_values
      )
    ),
    -- Get related INC items
    related_inc_items AS (
      SELECT 
        rh.inc,
        rh.related_inc,
        rh.item_name as related_inc_item_name
      FROM public.related_h6 rh
      WHERE rh.inc IN (SELECT inc::text FROM part_base WHERE inc IS NOT NULL)
      LIMIT 5
    ),
    -- Check for hazmat codes
    hazmat AS (
      SELECT 
        hm.code as hazmat_code,
        hm.explaination as hazmat_description
      FROM public.wp_hazardous_material_codes hm
      WHERE EXISTS (
        SELECT 1 FROM characteristics c 
        WHERE c.requirements_statement LIKE '%HAZARD%' 
          AND c.clear_text_reply = hm.code
      )
    )
    SELECT 
      pb.*,
      -- Aggregate characteristics into JSON array
      (
        SELECT json_agg(json_build_object(
          'mrc', c.mrc,
          'requirements_statement', c.requirements_statement,
          'clear_text_reply', c.clear_text_reply
        ))
        FROM characteristics c
        WHERE c.niin = pb.niin
      ) as characteristics,
      -- Aggregate related NSNs
      (
        SELECT json_agg(json_build_object(
          'related_nsn', r.related_nsn,
          'related_item_name', r.related_item_name,
          'related_part_number', r.related_part_number,
          'related_cage_code', r.related_cage_code
        ))
        FROM related_nsns r
      ) as related_parts,
      -- INC details
      (
        SELECT row_to_json(id.*)
        FROM inc_details id
        LIMIT 1
      ) as inc_details,
      -- Related INC items
      (
        SELECT json_agg(json_build_object(
          'related_inc', ri.related_inc,
          'related_inc_item_name', ri.related_inc_item_name
        ))
        FROM related_inc_items ri
      ) as related_inc_items,
      -- Hazmat info
      (
        SELECT json_agg(json_build_object(
          'hazmat_code', h.hazmat_code,
          'hazmat_description', h.hazmat_description
        ))
        FROM hazmat h
      ) as hazmat_info
    FROM part_base pb;
  `;
  
  try {
    const client = await pool.connect();
    console.log(`[DB Enhanced] Fetching comprehensive data for NSN: ${nsn}`);
    const result = await client.query(query, [nsn]);
    client.release();
    
    console.log(`[DB Enhanced] Found ${result.rows.length} record(s) with enhanced data`);
    return result.rows;
  } catch (error) {
    console.error('[DB Enhanced] Error fetching enhanced part data:', error);
    throw new Error('Failed to fetch enhanced part data from database');
  }
}

/**
 * Get all unique characteristic types for display
 */
export async function getCharacteristicTypes() {
  const query = `
    SELECT DISTINCT mrc, requirements_statement, COUNT(*) as count
    FROM public.char_data
    GROUP BY mrc, requirements_statement
    ORDER BY count DESC
    LIMIT 50;
  `;
  
  try {
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('[DB Enhanced] Error fetching characteristic types:', error);
    throw error;
  }
}