#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production env if in production, otherwise default .env
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, envFile) });

const { Pool } = pg;

// Database configuration
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const PARTS_PER_SITEMAP = 3000;
const DOMAIN = 'https://skywardindustries.com';
const SITEMAP_DIR = path.join(__dirname, 'public', 'sitemap');

// Ensure sitemap directory exists
if (!fs.existsSync(SITEMAP_DIR)) {
  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
}

// FSG to name mapping (based on your actual URL structure)
const FSG_NAMES = {
  '10': 'weapons',
  '11': 'nuclear-ordnance',
  '12': 'fire-control-equipment',
  '13': 'ammunition-and-explosives',
  '14': 'guided-missiles',
  '15': 'aircraft-and-airframe-structural-components',
  '16': 'aircraft-components-and-accessories',
  '17': 'aircraft-launching-landing-and-ground-handling-equipment',
  '18': 'space-vehicles',
  '19': 'ships-small-craft-pontoons-and-floating-docks',
  '20': 'ship-and-marine-equipment',
  '22': 'railway-equipment',
  '23': 'ground-effect-vehicles-motor-vehicles-trailers-and-cycles',
  '24': 'tractors',
  '25': 'vehicular-equipment-components',
  '26': 'tires-and-tubes',
  '28': 'engines-turbines-and-components',
  '29': 'engine-accessories',
  '30': 'mechanical-power-transmission-equipment',
  '31': 'bearings',
  '32': 'woodworking-machinery-and-equipment',
  '34': 'metalworking-machinery',
  '35': 'service-and-trade-equipment',
  '36': 'special-industry-machinery',
  '37': 'agricultural-machinery-and-equipment',
  '38': 'construction-mining-excavating-and-highway-maintenance-equipment',
  '39': 'materials-handling-equipment',
  '40': 'rope-cable-chain-and-fittings',
  '41': 'refrigeration-air-conditioning-and-air-circulating-equipment',
  '42': 'fire-fighting-rescue-and-safety-equipment-and-environmental-protection-equipment-and-materials',
  '43': 'pumps-and-compressors',
  '44': 'furnace-steam-plant-and-drying-equipment-and-nuclear-reactors',
  '45': 'plumbing-heating-and-waste-disposal-equipment',
  '46': 'water-purification-and-sewage-treatment-equipment',
  '47': 'pipe-tubing-hose-and-fittings',
  '48': 'valves',
  '49': 'maintenance-and-repair-shop-equipment',
  '51': 'hand-tools',
  '52': 'measuring-tools',
  '53': 'hardware-and-abrasives',
  '54': 'prefabricated-structures-and-scaffolding',
  '55': 'lumber-millwork-plywood-and-veneer',
  '56': 'construction-and-building-materials',
  '58': 'communication-detection-and-coherent-radiation-equipment',
  '59': 'electrical-and-electronic-equipment-components',
  '60': 'fiber-optics-materials-components-assemblies-and-accessories',
  '61': 'electric-wire-and-power-and-distribution-equipment',
  '62': 'lighting-fixtures-and-lamps',
  '63': 'alarm-signal-and-security-detection-systems',
  '65': 'medical-hospital-dental-and-veterinary-equipment-and-supplies',
  '66': 'instruments-and-laboratory-equipment',
  '67': 'photographic-equipment',
  '68': 'chemicals-and-chemical-products',
  '69': 'training-aids-and-devices',
  '70': 'general-purpose-information-technology-equipment',
  '71': 'furniture',
  '72': 'household-and-commercial-furnishings-and-appliances',
  '73': 'food-preparation-and-serving-equipment',
  '74': 'office-machines-text-processing-systems-and-visible-record-equipment',
  '75': 'office-supplies-and-devices',
  '76': 'books-maps-and-other-publications',
  '77': 'musical-instruments-phonographs-and-home-type-radios',
  '78': 'recreational-and-athletic-equipment',
  '79': 'cleaning-equipment-and-supplies',
  '80': 'brushes-paints-sealers-and-adhesives',
  '81': 'containers-packaging-and-packing-supplies',
  '83': 'textiles-leather-furs-apparel-and-shoe-findings-tents-and-flags',
  '84': 'clothing-individual-equipment-and-insignia',
  '85': 'toiletries',
  '87': 'agricultural-supplies',
  '88': 'live-animals',
  '89': 'subsistence',
  '91': 'fuels-lubricants-oils-and-waxes',
  '93': 'nonmetallic-fabricated-materials',
  '94': 'nonmetallic-crude-materials',
  '95': 'metal-bars-sheets-and-shapes',
  '96': 'ores-minerals-and-their-primary-products',
  '99': 'miscellaneous'
};

// FSC names - using the pattern from your actual URLs
function getFscName(fsc) {
  // Your URLs use the pattern "nsn-" followed by category name
  // Since we don't have all FSC names, we'll use a generic pattern
  return 'nsn-category-' + fsc;
}

function generateSitemapXML(parts) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const part of parts) {
    const nsn = part.nsn.replace(/\s+/g, '-');
    const fsg = part.fsg || '99'; // Default to miscellaneous if no FSG
    const fsc = part.fsc || '9999'; // Default FSC if missing
    const groupName = FSG_NAMES[fsg] || 'miscellaneous';

    xml += '  <url>\n';
    xml += '    <loc>' + DOMAIN + '/catalog/' + fsg + '/' + groupName + '/' + fsc + '/' + getFscName(fsc) + '/nsn-' + nsn + '</loc>\n';
    xml += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

async function generateSitemaps() {
  console.log('Starting sitemap generation with 3000 parts per file...');
  console.log('Output directory: ' + SITEMAP_DIR);

  try {
    // Get total count of parts
    const countResult = await pool.query('SELECT COUNT(*) FROM public.nsn_with_inc WHERE nsn IS NOT NULL');
    const totalParts = parseInt(countResult.rows[0].count);
    console.log('Total parts in database: ' + totalParts.toLocaleString());

    const totalSitemaps = Math.ceil(totalParts / PARTS_PER_SITEMAP);
    console.log('Will generate ' + totalSitemaps + ' sitemap files');

    const sitemapFiles = [];

    // Generate individual sitemap files
    for (let i = 0; i < totalSitemaps; i++) {
      const offset = i * PARTS_PER_SITEMAP;
      const startNum = offset + 1;
      const endNum = Math.min(offset + PARTS_PER_SITEMAP, totalParts);

      // Query parts for this sitemap
      const query = 'SELECT nsn, item_name as part_name, fsc, fsg FROM public.nsn_with_inc WHERE nsn IS NOT NULL ORDER BY nsn LIMIT $1 OFFSET $2';

      console.log('Generating sitemap ' + (i + 1) + '/' + totalSitemaps + ': parts ' + startNum + '-' + endNum);

      const result = await pool.query(query, [PARTS_PER_SITEMAP, offset]);

      if (result.rows.length > 0) {
        const filename = startNum + '/' + endNum + '.xml';
        const filepath = path.join(SITEMAP_DIR, String(startNum));

        // Create directory if it doesn't exist
        if (!fs.existsSync(filepath)) {
          fs.mkdirSync(filepath, { recursive: true });
        }

        const fullPath = path.join(filepath, endNum + '.xml');
        const xml = generateSitemapXML(result.rows);

        fs.writeFileSync(fullPath, xml);
        console.log('Written: ' + filename + ' (' + result.rows.length + ' parts)');

        sitemapFiles.push({
          loc: DOMAIN + '/sitemap/' + filename,
          lastmod: new Date().toISOString()
        });
      }
    }

    // Generate sitemap index
    console.log('\nGenerating sitemap index...');
    let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const sitemap of sitemapFiles) {
      indexXml += '  <sitemap>\n';
      indexXml += '    <loc>' + sitemap.loc + '</loc>\n';
      indexXml += '    <lastmod>' + sitemap.lastmod.split('T')[0] + '</lastmod>\n';
      indexXml += '  </sitemap>\n';
    }

    indexXml += '</sitemapindex>';

    const indexPath = path.join(__dirname, 'public', 'sitemap_index.xml');
    fs.writeFileSync(indexPath, indexXml);
    console.log('Sitemap index written to: ' + indexPath);

    // Summary
    console.log('\nSitemap generation complete!');
    console.log('Summary:');
    console.log('   - Total parts: ' + totalParts.toLocaleString());
    console.log('   - Sitemap files: ' + sitemapFiles.length);
    console.log('   - Parts per file: ' + PARTS_PER_SITEMAP);
    console.log('   - Output directory: ' + SITEMAP_DIR);

    // Update robots.txt reminder
    console.log('\nRemember to ensure your robots.txt includes:');
    console.log('   Sitemap: ' + DOMAIN + '/sitemap_index.xml');

  } catch (error) {
    console.error('Error generating sitemaps:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
generateSitemaps().catch(console.error);