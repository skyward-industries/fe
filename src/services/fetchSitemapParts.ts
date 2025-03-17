export interface SitemapPart {
  nsn: string;
  fsg: string;
  fsc: string;
  fsc_title: string;
  fsg_title: string;
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
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/sitemap-parts?limit=${batchSize}&offset=${offset}`;
  console.log("📡 Fetching parts from:", apiUrl);

  try {
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap parts: ${res.statusText}`);
    }

    const { data }: SitemapResponse = await res.json();
    console.log(`✅ Fetched ${data.length} parts (Offset: ${offset})`);

    return data;
  } catch (error) {
    console.error("❌ Error fetching sitemap parts:", error);
    throw new Error("Failed to fetch sitemap parts");
  }
}
