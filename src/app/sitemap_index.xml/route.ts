export const dynamic = 'force-dynamic'; // ✅ Generate fresh with new batch size

export async function GET() {
  const totalParts = 1000000; // Updated to match actual sitemap count
  const batchSize = 2000; // Must match the sitemap route batch size
  const totalSitemaps = Math.ceil(totalParts / batchSize);
  const today = new Date().toISOString();

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  sitemapIndex += `
  <sitemap>
    <loc>https://skywardparts.com/sitemap-priority.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://skywardparts.com/sitemap-groups.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>\n`;

  for (let i = 0; i < totalSitemaps; i++) {
    const startRange = i * batchSize + 1;
    const endRange = Math.min((i + 1) * batchSize, totalParts);

    sitemapIndex += `
  <sitemap>
    <loc>https://skywardparts.com/sitemap-${startRange}-${endRange}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>\n`;
  }

  sitemapIndex += `</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}