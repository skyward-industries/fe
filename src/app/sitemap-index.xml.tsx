import { fetchGroups } from "@/services/fetchGroups";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const groups = await fetchGroups();

  let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  groups.forEach((group) => {
    sitemapIndex += `
      <sitemap>
        <loc>https://skywardparts.com/sitemap-group-${group.id}.xml</loc>
      </sitemap>
    `;
  });

  sitemapIndex += `</sitemapindex>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemapIndex);
  res.end();

  return { props: {} };
};

export default function SitemapIndex() {
  return null;
};
