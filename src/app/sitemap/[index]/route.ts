import { fetchSitemapParts } from "@/services/fetchSitemapParts";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ index: string }> }) {
  const params = await props.params;
  console.log("📝 Generating sitemap for index:", params.index);

  const batchSize = 50000;
  const index = parseInt(params.index, 10); // Convert to integer

  if (isNaN(index) || index < 1) {
    console.error("❌ Invalid sitemap index:", params.index);
    return new NextResponse("Invalid sitemap index", { status: 400 });
  }

  const offset = (index - 1) * batchSize;

  // Fetch parts for this index (batch)
  const parts = await fetchSitemapParts(batchSize, offset);

  if (parts.length === 0) {
    console.warn("⚠️ No data for sitemap index:", index);
    return new NextResponse("No data for this sitemap", { status: 404 });
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  parts.forEach((part) => {
    const url = `https://skywardparts.com/catalog/${part.fsg}/${encodeURIComponent(part.fsg_title)}/${part.fsc}/NSN-${encodeURIComponent(part.fsc_title?.replace(/\s+/g, "-")?.replace(/,/g, ""))}/NSN-${part.nsn}`;

    sitemap += `
      <url>
        <loc>${url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  });

  sitemap += `</urlset>`;

  console.log(`✅ Successfully generated sitemap-${index}.xml`);

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
