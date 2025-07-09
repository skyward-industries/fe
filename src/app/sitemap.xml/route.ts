// File: src/app/sitemap.xml/route.ts

import { NextResponse } from "next/server";

export const revalidate = 86400; // Re-generate this sitemap once a day

export async function GET() {
  const totalParts = 7_200_000; 
  const batchSize = 3_000;
  const totalSitemaps = Math.ceil(totalParts / batchSize);

  // Use a fixed date or a date that updates less frequently (like daily)
  const today = new Date().toISOString(); 

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // --- ADD ENTRY FOR GROUPS SITEMAP ---
  sitemapIndex += `
  <sitemap>
    <loc>https://skywardparts.com/sitemap-groups.xml</loc>
    <lastmod>${today}</lastmod> // Use today's date or last update date for groups
  </sitemap>
`;
  // --- END ADDITION ---

  for (let i = 0; i < totalSitemaps; i++) {
    const startRange = i * batchSize + 1;
    const endRange = Math.min((i + 1) * batchSize, totalParts);

    sitemapIndex += `
  <sitemap>
    <loc>https://skywardparts.com/sitemap/${startRange}/${endRange}.xml</loc>
    <lastmod>${today}</lastmod> // Using today's date for part sitemap index entries is fine
  </sitemap>
`;
  }

  sitemapIndex += `</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}