import { fetchSitemapParts } from "@/services/fetchSitemapParts";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  props: { params: Promise<{ startRange: string; endRange: string }> }
) {
  const params = await props.params;
  const startRange = parseInt(params.startRange, 10);
  const endRange = parseInt(params.endRange, 10);
  const batchSize = 50000;

  console.log(
    `📝 Generating sitemap for range ${startRange}-${endRange} (batch size: ${batchSize})`
  );

  if (
    isNaN(startRange) ||
    startRange < 1 ||
    isNaN(endRange) ||
    endRange < startRange
  ) {
    console.error("❌ Invalid sitemap parameters:", params);
    return new NextResponse("Invalid sitemap parameters", { status: 400 });
  }

  const offset = startRange - 1;
  const parts = await fetchSitemapParts(batchSize, offset);

  if (parts.length === 0) {
    console.warn("⚠️ No data for sitemap range:", `${startRange}-${endRange}`);
    return new NextResponse("No data for this sitemap", { status: 404 });
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  parts.forEach((part) => {
    const url = `https://skywardparts.com/catalog/${
      part.fsg
    }/${encodeURIComponent(
      part.fsg_title.replace(/\s+/g, "-")?.replace(/,/g, "")
    )}/${part.fsc}/NSN-${encodeURIComponent(
      part.fsc_title?.replace(/\s+/g, "-")?.replace(/,/g, "")
    )}/NSN-${part.nsn}`;

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

  console.log(
    `✅ Successfully generated sitemap/${startRange}/${endRange}.xml`
  );

  const response = new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });

  // 🚀 Remove unnecessary headers
  response.headers.delete("vary");
  response.headers.delete("RSC");
  response.headers.delete("Next-Router-State-Tree");
  response.headers.delete("Next-Router-Prefetch");
  response.headers.delete("Next-Router-Segment-Prefetch");

  return response;
}
