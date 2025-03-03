export interface Group {
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


export async function fetchGroups(): Promise<Group[]> {
    try {
      const res = await fetch("http://localhost:5000/api/groups", { cache: "no-store" });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.statusText}`);
      }
  
      return res.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch product categories");
    }
  }
  