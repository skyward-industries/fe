import { fetchParts, Part } from "@/services/fetchParts";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const subgroupId = params?.id as string;
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  do {
    const response = await fetchParts(subgroupId, page, limit);
    const parts: Part[] = response.data;
    totalPages = response.pagination.totalPages;

    parts.forEach((part) => {
      sitemap += `
        <url>
          <loc>https://skywardparts.com/parts/${part.nsn}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    });

    page++;
  } while (page <= totalPages);

  sitemap += `</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function SitemapSubgroup() {
  return null;
};
