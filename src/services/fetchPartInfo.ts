export interface PartInfo {
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
}

export async function fetchPartInfo(nsn: string) : Promise<PartInfo[]> {
  console.log(nsn);
    try {
      const res = await fetch(`http://localhost:5000/api/partInfo/${nsn}`);
      if (!res.ok) {
        throw new Error(`Part not found`);
      }
  
      return res.json();
    } catch (error) {
      console.error("Error fetching part info:", error);
      throw new Error("Failed to fetch part");
    }
  }
  