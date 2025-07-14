// src/services/fetchPartInfo.ts

export interface Part {
  // Core Identifiers (from part_info, part_numbers)
  id?: string | null; // Assuming part_info.id is also selected, it's bigserial
  nsn: string;
  fsg: string;
  fsc: string;
  part_number?: string | null;
  cage_code?: string | null;

  // FSG/FSC Titles (from wp_fsgs)
  fsg_title?: string | null;
  fsc_title?: string | null;

  // Company / Address Details (from wp_cage_addresses)
  company_name?: string | null;
  company_name_2?: string | null; // Added based on DDL
  company_name_3?: string | null; // Added based on DDL
  company_name_4?: string | null; // Added based on DDL
  company_name_5?: string | null; // Added based on DDL
  street_address_1?: string | null;
  street_address_2?: string | null;
  po_box?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  date_est?: string | null; // e.g., "04-NOV-1974"
  last_update?: string | null; // Added based on DDL
  former_name_1?: string | null; // Added based on DDL
  former_name_2?: string | null; // Added based on DDL
  former_name_3?: string | null; // Added based on DDL
  former_name_4?: string | null; // Added based on DDL
  frn_dom?: string | null; // Added based on DDL

  // FLIS Management Data (from v_flis_management)
  moe_rule_vfm?: string | null; // Matches SQL alias and frontend
  aac?: string | null;
  sos?: string | null;
  sosm?: string | null;
  unit_of_issue?: string | null;
  controlled_inventory_code?: string | null;
  shelf_life_code?: string | null;
  replenishment_code?: string | null;
  management_control_code?: string | null;
  use_status_code?: string | null;
  row_effective_date?: string | null; // Date type in DB, comes as ISO string
  row_obs_date_fm?: string | null;    // Date type in DB, comes as ISO string

  // Freight Info (from freight_info)
  activity_code?: string | null;
  nmfc_number?: number | null; // float8 in DB, fine as number
  nmfc_subcode?: string | null;
  uniform_freight_class?: string | null;
  ltl_class?: string | null;
  wcc?: string | null;
  tcc?: string | null; // Added based on DDL
  shc?: string | null;
  adc?: string | null;
  acc?: string | null;
  nmf_desc?: string | null; // Matches SQL alias and frontend

  // Other fields you might have from pi (part_info)
  niin?: string | null; // part_info has niin
  // If you need item_name, end_item_name, definition, fiig, mrc, etc.
  // these must be selected in the SQL query and typically come from an 'item_names' or 'char_data' table
  // that you might need to join as well. They are NOT in the DDLs you provided, but were in your old query.
  // For now, I'll add them with a comment as placeholder.
  item_name?: string | null;
  end_item_name?: string | null;
  definition?: string | null;
  fiig?: string | null;
  mrc?: string | null;
  requirements_statement?: string | null;
  clear_text_reply?: string | null;
  related_inc?: string | null;
  related_item_name?: string | null;
  characteristics?: Array<{
    mrc: string;
    requirements_statement: string;
    clear_text_reply: string;
  }>;
}

// Function to fetch part information for a given NSN
export async function fetchPartInfo(nsn: string): Promise<Part[]> {
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || 'http://localhost:3000'}/api/partInfo/${nsn}`);

    // --- NEW DEBUGGING CODE ---
    // Get the raw text of the response, no matter what it is
    const rawText = await res.text();

    // Log the raw response to the console. This is the crucial step.
    console.log('--- RAW API RESPONSE FOR /api/partInfo ---');
    console.log(rawText);
    console.log('------------------------------------------');
    // --- END DEBUGGING CODE ---

    if (!res.ok) {
      // We already have the text, so we don't need to fetch it again.
      throw new Error(`API responded with status ${res.status}. Response: ${rawText}`);
    }

    // Now, try to parse the text we already received
    const data: Part[] = JSON.parse(rawText);
    return data;
  } catch (error: any) {
      console.error("Error fetching part info in service:", error);
      throw new Error(`Failed to retrieve NSN part details: ${error.message}`);
    }
}