import { Subgroup } from "@/types";

export interface Subgroup {
  id: string;
  fsg: string;
  fsc: string;
  fsg_title: string;
  fsg_notes?: string | null;
  fsc_title: string;
  fsc_notes?: string | null;
  fsc_inclusions?: string | null;
  fsc_exclusions?: string | null;
}

export async function fetchSubgroups(fsg: string): Promise<Subgroup[]> {
  try {
    const response = await fetch(`http://localhost:5000/api/subgroups/${fsg}`);
    if (!response.ok) {
      throw new Error("Failed to fetch subgroups");
    }
    return response.json();
  } catch (error) {
    console.error("❌ Error fetching subgroups:", error);
    return [];
  }
}
