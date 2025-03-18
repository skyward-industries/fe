import { NextResponse } from "next/server";

export async function GET() {
  const totalParts = 7_200_000;
  const batchSize = 50_000;
  const totalSitemaps = Math.ceil(totalParts / batchSize);

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  for (let i = 0; i < totalSitemaps; i++) {
    const startRange = i * batchSize + 1;
    const endRange = (i + 1) * batchSize;
    
    sitemapIndex += `
      <sitemap>
        <loc>https://skywardparts.com/sitemap-${startRange}-${endRange}.xml</loc>
      </sitemap>
    `;
  }

  sitemapIndex += `</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: { "Content-Type": "application/xml" },
  });
}
