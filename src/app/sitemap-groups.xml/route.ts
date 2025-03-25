import { fetchGroups, Group } from "@/services/fetchGroups";

export const dynamic = "force-dynamic"; // Ensures fresh data on every request

function generateSiteMap(groups: Group[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${groups
      .map((group) => {
        return `
      <url>
        <loc>https://skywardparts.com/catalog/${group.fsg}/${encodeURIComponent(
          group.fsg_title
            ?.replace(/\s+/g, "-")
            ?.replace(/,/g, "")
            ?.toLowerCase()
        )}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
      })
      .join("\n")}
  </urlset>`;
}

export async function GET() {
  const groups = await fetchGroups();

  if (groups.length === 0) {
    return new Response("No data for this sitemap", { status: 404 });
  }

  const sitemap = generateSiteMap(groups);

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
