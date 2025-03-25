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
  
  export async function fetchSitemapSubgroups(): Promise<Subgroup[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sitemap-subgroups`);
      if (!response.ok) {
        throw new Error("Failed to fetch subgroups");
      }
      return response.json();
    } catch (error) {
      console.error("❌ Error fetching subgroups:", error);
      return [];
    }
  }
  