import { fetchParts } from "@/services/fetchParts";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ fsc: string }> }) {
  const params = await props.params;
  console.log("Fetching subgroup sitemap for ID:", params.fsc);
  const cleanFsc = params.fsc.replace(".xml", "");

  const limit = 100;
  let page = 1;
  let totalPages = 1;

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  do {
    const response = await fetchParts(cleanFsc, page, limit);
    const parts = response.data;
    totalPages = response.pagination.totalPages;

    parts.forEach((part) => {
      sitemap += `
        <url>
          <loc>https://skywardparts.com/search?nsn=${part.nsn}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    });

    page++;
  } while (page <= totalPages);

  sitemap += `</urlset>`;

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
