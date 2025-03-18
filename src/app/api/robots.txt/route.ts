import { NextResponse } from "next/server";

export async function GET() {
  const totalParts = 14000000; // Replace with a DB query if needed
  const batchSize = 50000;
  const totalSitemaps = Math.ceil(totalParts / batchSize);

  let robotsTxt = `# *
User-agent: *
Allow: /

# Host
Host: https://skywardparts.com

# Sitemap Index
Sitemap: https://skywardparts.com/api/sitemap-index.xml

# Generated Sitemaps
`;

  for (let i = 0; i < totalSitemaps; i++) {
    const start = i * batchSize + 1;
    const end = (i + 1) * batchSize;
    robotsTxt += `Sitemap: https://skywardparts.com/api/sitemap/${start}/${end}.xml\n`;
  }

  return new NextResponse(robotsTxt, {
    headers: { "Content-Type": "text/plain" },
  });
}
