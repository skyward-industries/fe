import { fetchSitemapParts } from "@/services/fetchSitemapParts";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { startRange: string; endRange: string } }
) {
  const startRange = parseInt(params.startRange, 10);
  const endRange = parseInt(params.endRange, 10);
  const batchSize = 50000;

  console.log(`📝 Generating sitemap for range ${startRange}-${endRange}`);

  if (isNaN(startRange) || startRange < 1 || isNaN(endRange) || endRange < startRange) {
    return new NextResponse("Invalid sitemap parameters", { status: 400 });
  }

  const offset = startRange - 1;
  const parts = await fetchSitemapParts(batchSize, offset);

  if (parts.length === 0) {
    return new NextResponse("No data for this sitemap", { status: 404 });
  }

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  parts.forEach((part) => {
    const url = `https://skywardparts.com/catalog/${part.fsg}/${encodeURIComponent(part.fsg_title)}/${part.fsc}/NSN-${encodeURIComponent(part.fsc_title)}/NSN-${part.nsn}`;
    sitemap += `<url><loc>${url}</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });

  sitemap += `</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      "X-Content-Type-Options": "nosniff",
    },
  });
}
