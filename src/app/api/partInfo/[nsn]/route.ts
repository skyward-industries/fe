import { NextResponse } from "next/server";
// @ts-ignore
import {pool} from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { nsn: string } }
) {
  const rawNsn = params.nsn;
  const nsn = rawNsn.replace(/-/g, "");

  console.log(`📥 Incoming request for NSN: ${rawNsn} → ${nsn}`);

  const query = `
    SELECT 
      pi.nsn,
      pi.fsg,
      pi.fsc,
      fsgs.fsg_title,
      fsgs.fsc_title,
      pn.part_number,
      pn.cage_code,
      addr.company_name,
      addr.street_address_1,
      addr.street_address_2,
      addr.po_box,
      addr.city,
      addr.state,
      addr.zip,
      addr.country,
      addr.date_est,
      vfm.moe_rule AS moe_rule_vfm,
      vfm.aac,
      vfm.sos,
      vfm.sosm,
      vfm.unit_of_issue,
      vfm.controlled_inventory_code,
      vfm.shelf_life_code,
      vfm.replenishment_code,
      vfm.management_control_code,
      vfm.use_status_code,
      vfm.effective_date AS row_effective_date,
      vfm.row_observation_date AS row_obs_date_fm,
      fi.activity_code,
      fi.nmfc_number,
      fi.nmfc_subcode,
      fi.uniform_freight_class,
      fi.ltl_class,
      fi.wcc,
      fi.shc,
      fi.adc,
      fi.acc,
      fi.nmf_desc,
      pi.niin
    FROM part_info pi
    LEFT JOIN part_numbers pn ON pi.nsn = pn.nsn
    LEFT JOIN wp_cage_addresses addr ON pn.cage_code = addr.cage_code
    LEFT JOIN v_flis_management vfm ON vfm.niin = pi.niin
    LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
    LEFT JOIN freight_info fi ON pi.niin = fi.niin
    WHERE REPLACE(pi.nsn, '-', '') = $1
  `;

  try {
    const result = await pool.query(query, [nsn]);
    const parts: any[] = result.rows;
    // Batch fetch all characteristics for all relevant niins
    const niins = parts.map(p => p.niin).filter(Boolean);
    let charMap: { [niin: string]: Array<{ mrc: string; requirements_statement: string; clear_text_reply: string }> } = {};
    if (niins.length > 0) {
      const charRes = await pool.query(
        `SELECT niin, mrc, requirements_statement, clear_text_reply FROM char_data WHERE niin = ANY($1)`,
        [niins]
      );
      for (const row of charRes.rows) {
        if (!charMap[row.niin]) charMap[row.niin] = [];
        charMap[row.niin].push({
          mrc: row.mrc,
          requirements_statement: row.requirements_statement,
          clear_text_reply: row.clear_text_reply,
        });
      }
    }
    for (const part of parts) {
      part.characteristics = charMap[part.niin] || [];
    }
    console.log(`✅ Found ${result.rowCount} record(s) for NSN: ${rawNsn}`);
    return NextResponse.json(parts);
  } catch (error: any) {
    console.error("❌ DB query failed:", error.message || error);
    return NextResponse.json(
      { error: "DB query failed", detail: error.message || error },
      { status: 500 }
    );
  }
}
