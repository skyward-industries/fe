// File: src/app/sitemap/[startRange]/[endRange].xml/route.ts
import { slugify } from "@/utils/slugify";

export const dynamic = "force-dynamic"; // Always generate fresh
export const maxDuration = 60; // 60 seconds for high ID sitemap generation

type SitemapPart = {
  fsg: string;
  fsc: string;
  fsg_title: string;
  fsc_title: string;
  nsn: string;
};

function generateSiteMap(parts: SitemapPart[]) {
  const baseUrl = "https://skywardparts.com";
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parts
  .filter((part) => part.fsg_title && part.fsc_title && part.nsn)
  .map((part) => {
    const fsgSlug = slugify(part.fsg_title);
    const fscSlug = slugify(part.fsc_title);
    const formattedNsn = formatNSN(part.nsn);
    
    return `  <url>
    <loc>${baseUrl}/catalog/${part.fsg}/${fsgSlug}/${part.fsc}/${fscSlug}/${formattedNsn}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;
}

function formatNSN(nsn: string): string {
  // Add dashes to NSN: 1234567890123 -> 1234-56-789-0123
  if (nsn && nsn.length === 13) {
    return `${nsn.slice(0, 4)}-${nsn.slice(4, 6)}-${nsn.slice(6, 9)}-${nsn.slice(9)}`;
  }
  return nsn;
}

export async function GET(
  req: Request,
  props: { params: Promise<{ startRange: string; endRange: string }> }
) {
  const params = await props.params;
  const startRange = parseInt(params.startRange, 10);
  const endRange = parseInt(params.endRange, 10);
  const batchSize = 2000; // Optimized batch size for fast loading

  console.log(`🚀 FAST Sitemap request for range: ${startRange.toLocaleString()}-${endRange.toLocaleString()}`);

  // Send early headers to prevent browser timeout
  const headers = new Headers({
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
    "X-Content-Type-Options": "nosniff",
    "Connection": "keep-alive",
    "X-Processing": "true"
  });

  // Calculate actual range size
  const rangeSize = endRange - startRange + 1;
  
  if (
    isNaN(startRange) ||
    isNaN(endRange) ||
    startRange < 1 ||
    endRange < startRange ||
    rangeSize > batchSize
  ) {
    console.log(`❌ Invalid parameters: ${startRange}-${endRange} (range size: ${rangeSize}, max: ${batchSize})`);
    return new Response("Invalid sitemap parameters", { status: 400 });
  }

  const offset = startRange - 1;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://skywardparts.com";

  let parts: SitemapPart[] = [];

  try {
    // Use regular endpoint for all ranges - optimized API is causing 404s
    const endpoint = `${baseUrl}/api/sitemap-parts`;
    const apiUrl = `${endpoint}?limit=${batchSize}&offset=${offset}`;
    
    console.log(`🔗 Calling API: ${apiUrl}`);
    
    const startTime = Date.now();
    
    // Universal fast timeout for all ranges
    const controller = new AbortController();
    const fetchTimeout = 15000; // 15s for all ranges - fast and consistent
    const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);
    
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Sitemap-Generator/1.0'
      }
    });

    clearTimeout(timeoutId);
    const fetchTime = Date.now() - startTime;

    if (!res.ok) {
      console.error(`⚠️ API error: ${res.status} ${res.statusText} (${fetchTime}ms)`);
      
      // For high ranges, return empty sitemap instead of error
      if (startRange > 10000000) {
        console.log(`📭 High range API error, returning empty sitemap for ${startRange}-${endRange}`);
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
        return new Response(emptySitemap, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
            "X-Parts-Count": "0",
            "X-Empty-Sitemap": "true",
            "X-API-Error": res.status.toString()
          },
        });
      }
      
      if (res.status === 408) {
        return new Response("Sitemap generation timeout", { status: 504 });
      }
      
      return new Response("Failed to fetch sitemap data", { status: 502 });
    } else {
      const raw = await res.json();
      parts = Array.isArray(raw) ? raw : raw?.data || [];
      console.log(`📊 Retrieved ${parts.length} parts in ${fetchTime}ms for range ${startRange}-${endRange}`);
    }


  } catch (err: any) {
    console.error(`❌ Failed to fetch sitemap parts for range ${startRange}-${endRange}:`, err.message);
    
    // For high ranges, return empty sitemap on any error
    if (startRange > 10000000) {
      console.log(`📭 High range fetch error, returning empty sitemap for ${startRange}-${endRange}`);
      const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
      return new Response(emptySitemap, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "X-Parts-Count": "0",
          "X-Empty-Sitemap": "true",
          "X-Fetch-Error": "true"
        },
      });
    }
    
    if (err.name === 'AbortError') {
      return new Response("Sitemap generation timeout", { status: 504 });
    }
    
    return new Response("Error connecting to API", { status: 500 });
  }

  // For empty ranges, return an empty sitemap instead of 404
  // This prevents search engines from repeatedly trying to fetch "missing" sitemaps
  if (!parts || parts.length === 0) {
    console.log(`📭 No data found for range ${startRange}-${endRange} - returning empty sitemap`);
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new Response(emptySitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400", // Cache empty sitemaps for 24 hours
        "X-Content-Type-Options": "nosniff",
        "X-Parts-Count": "0",
        "X-Empty-Sitemap": "true"
      },
    });
  }

  // Filter out any invalid parts before generating XML
  const validParts = parts.filter(part => 
    part.fsg_title && 
    part.fsc_title && 
    part.nsn && 
    part.fsg && 
    part.fsc
  );

  if (validParts.length === 0) {
    console.log(`📭 No valid parts after filtering for range ${startRange}-${endRange} - returning empty sitemap`);
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new Response(emptySitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400", // Cache empty sitemaps for 24 hours
        "X-Content-Type-Options": "nosniff",
        "X-Parts-Count": "0",
        "X-Empty-Sitemap": "true"
      },
    });
  }

  console.log(`✅ Generating sitemap with ${validParts.length} valid parts`);

  const sitemap = generateSiteMap(validParts);

  // Use the pre-defined headers and add response-specific ones
  headers.set("X-Parts-Count", validParts.length.toString());
  headers.set("X-Generation-Time", Date.now().toString());
  headers.delete("X-Processing"); // Remove processing indicator

  return new Response(sitemap, {
    status: 200,
    headers: headers,
  });
}