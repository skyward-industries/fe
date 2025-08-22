import fs from 'fs';

const totalParts = 7600000; // 7.6 million products
const batchSize = 2000; // 2000 products per sitemap
const totalSitemaps = Math.ceil(totalParts / batchSize);
const today = new Date().toISOString();

let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://skywardparts.com/sitemap-priority.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://skywardparts.com/sitemap-groups.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;

// Generate entries for all product sitemaps
for (let i = 0; i < totalSitemaps; i++) {
  const startRange = i * batchSize + 1;
  const endRange = Math.min((i + 1) * batchSize, totalParts);
  
  sitemapIndex += `
  <sitemap>
    <loc>https://skywardparts.com/sitemap-${startRange}-${endRange}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`;
}

sitemapIndex += `
</sitemapindex>`;

// Write to file
fs.writeFileSync('public/sitemap_index.xml', sitemapIndex);
console.log(`Generated sitemap_index.xml with ${totalSitemaps + 2} sitemap entries`);
console.log(`Last sitemap range: sitemap-${(totalSitemaps - 1) * batchSize + 1}-${totalParts}.xml`);