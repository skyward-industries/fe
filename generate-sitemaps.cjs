const fs = require('fs');
const path = require('path');

const totalParts = 7200000;
const batchSize = 3000;
const totalSitemaps = Math.ceil(totalParts / batchSize);
const maxSitemapsPerIndex = 500;

const today = new Date().toISOString();
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Generate all sitemap-index-N.xml files
let sitemapIndexCount = 0;
for (let i = 0; i < totalSitemaps; i += maxSitemapsPerIndex) {
  const indexFileNum = sitemapIndexCount + 1;
  const subIndexPath = path.join(publicDir, `sitemap-index-${indexFileNum}.xml`);
  let subIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (let j = i; j < i + maxSitemapsPerIndex && j < totalSitemaps; j++) {
    const start = j * batchSize + 1;
    const end = Math.min((j + 1) * batchSize, totalParts);
    subIndexXml += `  <sitemap>\n    <loc>https://skywardparts.com/sitemap/${start}/${end}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
  }

  subIndexXml += `</sitemapindex>`;
  fs.writeFileSync(subIndexPath, subIndexXml);
  console.log(`✅ Created sitemap-index-${indexFileNum}.xml`);
  sitemapIndexCount++;
}

// Generate main sitemap.xml pointing to all sitemap-index-N.xml files
let mainIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (let k = 1; k <= sitemapIndexCount; k++) {
  mainIndex += `  <sitemap>\n    <loc>https://skywardparts.com/sitemap-index-${k}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
}
mainIndex += `</sitemapindex>`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), mainIndex);
console.log(`✅ Created sitemap.xml with ${sitemapIndexCount} index files`);
