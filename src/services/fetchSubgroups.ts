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
console.log("Debug: fetchSubgroups is running")
export async function fetchSubgroups(fsg: string): Promise<Subgroup[]> {
  try {
    // Check if fsg is valid
    if (!fsg) {
      console.warn("⚠️ fetchSubgroups called with an empty fsg value.");
      return [];
    }

    // Sanitize fsg to remove unwanted characters
    const sanitizedFsg = fsg.replace(/,|%2C/g, ""); // Removing commas and encoded commas
    console.log(`🔍 Fetching subgroups for sanitized FSG: ${sanitizedFsg}`);

    // Construct API URL
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/subgroups/${sanitizedFsg}`;
    console.log(`🌍 API Request URL: ${apiUrl}`);

    // Make API request
    const response = await fetch(apiUrl);

    // Check response status
    if (!response.ok) {
      throw new Error(`❌ Failed to fetch subgroups: ${response.status} ${response.statusText}`);
    }

    // Parse response JSON
    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.length} subgroups.`);
    
    return data;
  } catch (error) {
    console.error("🚨 Error in fetchSubgroups:", error);
    return [];
  }
}
