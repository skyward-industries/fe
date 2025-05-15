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

  // From p_help
  code?: string;
  literal?: string;
  description?: string; // aliased as help_description in SQL
  regs?: string;

  // From nsn_with_inc
  inc?: number;
  item_name?: string;
  sos?: string;
  end_item_name?: string;
  cancelled_niin?: string;

  // From freight_info
  uniform_freight_class?: number;
  ltl_class?: string;
  lcl_class?: string;
  rate_value_code?: number;
  weight_computation_code?: string;
  type_container_code?: string;
  special_handling_code?: string;
  air_dimension_code?: string;
  air_commodity_code?: string;
  integration_code?: string;
  nmfc_description?: string;
  hmc?: string;
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
