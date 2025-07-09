// @ts-ignore
import {fetchSitemapSubgroups,Subgroup,} from "@/services/fetchSitemapSubgroups";
// @ts-ignore
import { slugify } from "@/utils/slugify";

export const dynamic = "force-dynamic"; // Ensures fresh data on every request

function generateSiteMap(subgroups: Subgroup[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${subgroups
      .map((subgroup) => {
        const fsgTitle = slugify(subgroup.fsg_title);
        const fscTitle = slugify(subgroup.fsc_title);
        return `
      <url>
        <loc>https://skywardparts.com/catalog/${subgroup.fsg}/${fsgTitle}/${
          subgroup.fsc
        }/nsn-${fscTitle}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
      })
      .join("\n")}
  </urlset>`;
}

export async function GET() {
  const subgroups = await fetchSitemapSubgroups();

  if (subgroups.length === 0) {
    return new Response("No data for this sitemap", { status: 404 });
  }

  const sitemap = generateSiteMap(subgroups);

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
