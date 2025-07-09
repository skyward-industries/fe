// File: src/services/fetchSitemapParts.ts

export interface SitemapPart {
  nsn: string;
  fsg: string;
  fsc: string;
  fsc_title: string;
  fsg_title: string;
  updated_at: string;
}

export interface SitemapResponse {
  data: SitemapPart[];
  pagination: {
    limit: number;
    offset: number;
    nextOffset: number;
    hasMore: boolean;
  };
}

/**
 * Fetches parts from Express API for sitemap generation.
 * @param {number} batchSize - Number of parts per request.
 * @param {number} offset - Offset for pagination.
 * @returns {Promise<SitemapPart[]>}
 */
export async function fetchSitemapParts(batchSize: number = 50000, offset: number = 0): Promise<SitemapPart[]> {

  // <<< THIS IS THE CORRECTED LOGIC >>>
  // Use the internal URL when running on the server via PM2,
  // otherwise fall back to the public URL.
  const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const apiUrl = `${baseUrl}/api/sitemap-parts?limit=${batchSize}&offset=${offset}`;
  // <<< END CORRECTED LOGIC >>>

  console.log("📡 Fetching parts from:", apiUrl);

  try {
    const res = await fetch(apiUrl);

    if (!res.ok) {
      // Log more details on API response not OK
      const errorText = await res.text(); // Get the error body if available
      console.error(`API response not OK: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`Failed to fetch sitemap parts: ${res.statusText}`);
    }

    const { data }: SitemapResponse = await res.json();
    console.log(`✅ Fetched ${data.length} parts (Offset: ${offset})`);

    return data;
  } catch (error) {
    console.error("❌ Error fetching sitemap parts:", error);
    // Rethrow the specific error for the Next.js error handler to catch
    throw error; 
  }
}