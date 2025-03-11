import { fetchGroups } from "@/services/fetchGroups";
import { NextResponse } from "next/server";

export async function GET() {
  const groups = await fetchGroups();

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  groups.forEach((group) => {
    sitemapIndex += `
      <sitemap>
        <loc>https://skywardparts.com/sitemap-group-${group.fsg}.xml</loc>
        <title>FSG -${group.fsg_title} (${group.fsg}) - FSC ${group.fsc_title} (${group.fsc})</title>
      </sitemap>
    `;
  });

  sitemapIndex += `</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: { "Content-Type": "application/xml" },
  });
}
