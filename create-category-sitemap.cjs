#!/usr/bin/env node

// Creates a priority sitemap with category pages for faster crawling

const fs = require('fs');

async function createCategorySitemap() {
  console.log('Creating category priority sitemap...\n');
  
  // Your main FSG categories (add more as needed)
  const categories = [
    { fsg: '10', name: 'weapons', priority: 0.9 },
    { fsg: '11', name: 'nuclear-ordnance', priority: 0.8 },
    { fsg: '12', name: 'fire-control-equipment', priority: 0.8 },
    { fsg: '13', name: 'ammunition-and-explosives', priority: 0.9 },
    { fsg: '14', name: 'guided-missiles', priority: 0.8 },
    { fsg: '15', name: 'aircraft-and-airframe-structural-components', priority: 0.9 },
    { fsg: '16', name: 'aircraft-components-and-accessories', priority: 0.9 },
    { fsg: '17', name: 'aircraft-launching-landing-and-ground-handling-equipment', priority: 0.8 },
    { fsg: '20', name: 'ship-and-marine-equipment', priority: 0.8 },
    { fsg: '25', name: 'vehicular-equipment-components', priority: 0.8 },
    { fsg: '28', name: 'engines-turbines-and-components', priority: 0.9 },
    { fsg: '29', name: 'engine-accessories', priority: 0.8 },
    { fsg: '30', name: 'mechanical-power-transmission-equipment', priority: 0.8 },
    { fsg: '31', name: 'bearings', priority: 0.8 },
    { fsg: '41', name: 'refrigeration-air-conditioning-and-air-circulating-equipment', priority: 0.7 },
    { fsg: '47', name: 'pipe-tubing-hose-and-fittings', priority: 0.8 },
    { fsg: '48', name: 'valves', priority: 0.8 },
    { fsg: '53', name: 'hardware-and-abrasives', priority: 0.8 },
    { fsg: '59', name: 'electrical-and-electronic-equipment-components', priority: 0.9 },
    { fsg: '60', name: 'fiber-optics-materials-components-assemblies-and-accessories', priority: 0.8 },
    { fsg: '66', name: 'instruments-and-laboratory-equipment', priority: 0.8 }
  ];
  
  const urls = [];
  
  // Add homepage
  urls.push({
    loc: 'https://skywardparts.com/',
    priority: '1.0',
    changefreq: 'daily'
  });
  
  // Add catalog page
  urls.push({
    loc: 'https://skywardparts.com/catalog',
    priority: '0.9',
    changefreq: 'daily'
  });
  
  // Add FSG category pages
  categories.forEach(cat => {
    urls.push({
      loc: `https://skywardparts.com/catalog/${cat.fsg}/${cat.name}`,
      priority: cat.priority.toString(),
      changefreq: 'weekly'
    });
  });
  
  // Generate sitemap XML
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  // Save the sitemap
  fs.writeFileSync('public/sitemap-categories.xml', sitemapContent);
  
  console.log(`✅ Created sitemap-categories.xml with ${urls.length} category pages`);
  console.log('\n📋 URL Breakdown:');
  console.log(`  - Homepage: 1`);
  console.log(`  - Catalog page: 1`);
  console.log(`  - FSG categories: ${categories.length}`);
  console.log(`  - Total: ${urls.length} URLs`);
  
  console.log('\n🚀 Next steps:');
  console.log('1. Deploy: git add public/sitemap-categories.xml && git commit && git push');
  console.log('2. Submit to GSC: https://skywardparts.com/sitemap-categories.xml');
  console.log('3. Use URL Inspector on key category pages');
  console.log('4. These categories will help Google discover product pages faster!');
}

createCategorySitemap().catch(console.error);