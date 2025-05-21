export interface PartInfo {
  // Base part data
  part_number: string;
  cage_code: string;
  company_name: string;
  street_address_1?: string;
  street_address_2?: string;
  po_box?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  date_est: string;

  // From p_help (if used elsewhere)
  code?: string;
  literal?: string;
  description?: string; // aliased as help_description
  regs?: string;

  // From nsn_with_inc
  inc?: number;
  item_name?: string;
  sos?: string;
  end_item_name?: string;
  cancelled_niin?: string;

  // From freight_info
  activity_code?: string;
  nmfc_number?: number;
  nmfc_subcode?: string;
  uniform_freight_class?: string;
  ltl_class?: string;
  rate_value_code?: string; // mapped from fi.wcc
  weight_computation_code?: string; // fi.tcc
  special_handling_code?: string; // fi.shc
  air_dimension_code?: string; // fi.adc
  air_commodity_code?: string; // fi.acc
  nmfc_description?: string; // fi.nmf_desc

  // From standardized_parts (if still used)
  item_standardization_code?: string;
  origin_stdzn_decision_code?: string;
  decision_date?: string;
  niin_status_code?: number;

  // From v_flis_management
  moe_rule_vfm?: string;
  aac?: string;
  sosm?: string;
  unit_of_issue?: string;
  controlled_inventory_code?: string;
  shelf_life_code?: string;
  replenishment_code?: string;
  management_control_code?: string;
  use_status_code?: string;
  row_effective_date?: string;
  row_obs_date_fm?: string;

  // From v_moe_rule
  moe_rule_vmr?: string;
  moe_code?: string;
  acquisition_method_code?: string;
  amsc_suffix_code?: string;
  inventory_management_strategy_code?: string;
  date_assigned?: string;
  item_management_code?: string;
  item_management_activity?: string;
  acquisition_advice_code?: string;
  primary_inventory_control_activity?: string;
  pica_level_of_authority?: string;
  secondary_inventory_control_activity?: string;
  sica_level_of_authority?: string;
  submitter?: string;
  authorized_collaborator?: string;
  supporting_collaborator?: string;
  authorized_receiver?: string;
  supporting_receiver?: string;
  designated_support_point?: string;
  former_moe_rule?: string;
  row_obs_date_mr?: string;
}



export async function fetchPartInfo(nsn: string): Promise<PartInfo[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/partInfo/${nsn}`
    );
    if (!res.ok) {
      throw new Error(`Part not found`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching part info:", error);
    throw new Error("Failed to fetch part");
  }
}
