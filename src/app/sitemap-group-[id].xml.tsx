import { fetchSubgroups } from "@/services/fetchSubgroups";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const groupId = params?.id as string;
  const subgroups = await fetchSubgroups(groupId);

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  subgroups.forEach((subgroup) => {
    sitemap += `
      <sitemap>
        <loc>https://skywardparts.com/sitemap-subgroup-${subgroup.id}.xml</loc>
      </sitemap>
    `;
  });

  sitemap += `</sitemapindex>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function SitemapGroup() {
  return null;
};
