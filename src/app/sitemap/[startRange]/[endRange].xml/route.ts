import { fetchSitemapParts, SitemapPart } from "@/services/fetchSitemapParts";
import { slugify } from "@/utils/slugify";

export const dynamic = "force-dynamic"; // Ensures fresh data on every request

function generateSiteMap(parts: SitemapPart[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${parts
      .filter((part) => part.fsg_title && part.fsc_title && part.nsn)
      .map((part) => {
        const fsgSlug = slugify(part.fsg_title);
        const fscSlug = slugify(part.fsc_title);

        return `
      <url>
        <loc>https://skywardparts.com/catalog/${part.fsg}/${fsgSlug}/${
          part.fsc
        }/nsn-${fscSlug}/nsn-${part.nsn}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
      })
      .join("\n")}
  </urlset>`;
}

export async function GET(
  req: Request,
  props: { params: Promise<{ startRange: string; endRange: string }> }
) {
  const params = await props.params;
  const startRange = parseInt(params.startRange, 10);
  const endRange = parseInt(params.endRange, 10);
  const batchSize = 3000;

  if (
    isNaN(startRange) ||
    isNaN(endRange) ||
    startRange < 1 ||
    endRange < startRange
  ) {
    return new Response("Invalid sitemap parameters", { status: 400 });
  }

  const offset = startRange - 1;
  const parts = await fetchSitemapParts(batchSize, offset);

  if (parts.length === 0) {
    return new Response("No data for this sitemap", { status: 404 });
  }

  const sitemap = generateSiteMap(parts);

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
