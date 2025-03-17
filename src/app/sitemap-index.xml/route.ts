import { NextResponse } from "next/server";

export async function GET() {
  const totalSitemaps = 280;

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  for (let i = 1; i <= totalSitemaps; i++) {
    sitemapIndex += `
      <sitemap>
        <loc>https://skywardparts.com/sitemap-${i}.xml</loc>
      </sitemap>
    `;
  }

  sitemapIndex += `</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: { "Content-Type": "application/xml" },
  });
}
