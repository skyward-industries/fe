import { NextResponse } from "next/server";

export async function GET() {
  const totalParts = 7200000; // Replace with a DB query if needed
  const batchSize = 3000;
  const totalSitemaps = Math.ceil(totalParts / batchSize);

  let robotsTxt = `# *
User-agent: *
Allow: /

# Host
Host: https://skywardparts.com

# Sitemap Index
Sitemap: https://skywardparts.com/sitemap.xml
Sitemap: https://skywardparts.com/sitemap-priority.xml

# Generated Sitemaps
`;

  for (let i = 0; i < totalSitemaps; i++) {
    const start = i * batchSize + 1;
    const end = (i + 1) * batchSize;
    robotsTxt += `Sitemap: https://skywardparts.com/sitemap/${start}/${end}.xml\n`;
  }

  return new NextResponse(robotsTxt, {
    headers: { "Content-Type": "text/plain" },
  });
}
