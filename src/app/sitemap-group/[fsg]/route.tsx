import { fetchSubgroups } from "@/services/fetchSubgroups";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  props: { params: Promise<{ fsg: string }> }
) {
  const params = await props.params;
  const cleanFsg = params.fsg.replace(".xml", "");

  const subgroups = await fetchSubgroups(cleanFsg);
  console.log(subgroups, "subgroups", cleanFsg);

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  subgroups.forEach((subgroup) => {
    sitemap += `
      <sitemap>
        <loc>https://skywardparts.com/catalog/${subgroup.fsg}/${encodeURIComponent(subgroup.fsc_title.replace(/\s+/g, "-").replace(/,/g, ""))}</loc>
        <title>FSC ${subgroup.fsc_title} - ${subgroup.fsc}</title>
      </sitemap>
    `;
  });

  sitemap += `</sitemapindex>`;

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
