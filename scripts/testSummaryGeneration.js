import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Professional summary templates with variations
const summaryTemplates = {
  aerospace: [
    "This {item_name} represents a critical aerospace component manufactured to exacting standards.",
    "Engineered for aerospace applications, this {item_name} delivers reliable performance in demanding environments.",
    "The {item_name} serves essential functions in modern aircraft systems and aerospace equipment."
  ],
  defense: [
    "This military-grade {item_name} meets stringent defense specifications and requirements.",
    "Designed for defense applications, the {item_name} ensures operational readiness and reliability.",
    "The {item_name} is a vital component in military systems and equipment."
  ],
  industrial: [
    "This industrial-grade {item_name} provides robust performance in commercial applications.",
    "Engineered for durability, the {item_name} meets industrial standards and specifications.",
    "The {item_name} delivers consistent performance in industrial environments."
  ]
};

// Generate cost-effective professional summary
const generateProfessionalSummary = (part) => {
  const sections = [];
  
  // Determine category based on FSG/FSC
  let category = 'industrial';
  if (part.fsg && ['10', '11', '12', '13', '14', '15', '16', '17'].includes(part.fsg)) {
    category = 'defense';
  } else if (part.fsg && ['15', '16', '17', '20', '25', '28', '29'].includes(part.fsg)) {
    category = 'aerospace';
  }
  
  // Opening statement with variation
  const itemName = part.item_name || 'component';
  const templates = summaryTemplates[category];
  const openingTemplate = templates[Math.floor(Math.random() * templates.length)];
  sections.push(openingTemplate.replace('{item_name}', itemName));
  
  // Technical identification
  sections.push(`Identified by NSN ${part.nsn}${part.part_number ? ` and manufacturer part number ${part.part_number}` : ''}, this item ensures precise compatibility and procurement accuracy.`);
  
  // Classification details
  if (part.fsc_title || part.fsg_title) {
    const classification = part.fsc_title || part.fsg_title;
    sections.push(`Classified under ${classification}, it adheres to federal supply standards for quality assurance and interoperability.`);
  }
  
  // Manufacturer credibility
  if (part.company_name && part.cage_code) {
    sections.push(`Produced by ${part.company_name} (CAGE: ${part.cage_code}), a verified supplier in the defense industrial base.`);
  }
  
  // Supply chain information
  if (part.unit_of_issue) {
    sections.push(`Available in ${part.unit_of_issue} units, facilitating efficient inventory management and distribution.`);
  }
  
  // Key features based on management codes
  const features = [];
  if (part.shelf_life_code && !['0', 'NA'].includes(part.shelf_life_code)) {
    features.push('shelf-life managed');
  }
  if (part.aac && ['A', 'B', 'C'].includes(part.aac)) {
    features.push('acquisition advised');
  }
  if (part.controlled_inventory_code && part.controlled_inventory_code !== 'U') {
    features.push('controlled item');
  }
  
  if (features.length > 0) {
    sections.push(`This ${features.join(', ')} item requires specialized handling per military logistics protocols.`);
  }
  
  // Closing with call to action
  sections.push(`Skyward Industries maintains comprehensive inventory data and sourcing capabilities for this item. Our procurement specialists provide competitive pricing, availability verification, and expedited delivery options to meet your operational requirements.`);
  
  return sections.join(' ');
};

// Test the generation with sample data
async function testGeneration() {
  const client = await pool.connect();
  
  try {
    console.log('Testing summary generation with sample parts...\n');
    
    // Get 5 sample parts with different characteristics
    const result = await client.query(`
      SELECT DISTINCT ON (pi.nsn)
        pi.nsn, pi.fsg, pi.fsc, pi.niin,
        fsgs.fsg_title, fsgs.fsc_title,
        pn.part_number, pn.cage_code,
        addr.company_name,
        vfm.unit_of_issue, vfm.shelf_life_code, vfm.aac, vfm.controlled_inventory_code,
        (SELECT item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS item_name
      FROM public.part_info pi
      LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
      LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
      LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
      LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      WHERE pi.nsn IS NOT NULL
        AND fsgs.fsc_title IS NOT NULL
      ORDER BY pi.nsn
      LIMIT 5;
    `);
    
    console.log(`Found ${result.rows.length} sample parts\n`);
    
    // Generate and display summaries
    for (const part of result.rows) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`NSN: ${part.nsn}`);
      console.log(`Item: ${part.item_name || 'Unknown'}`);
      console.log(`FSC: ${part.fsc_title || 'N/A'}`);
      console.log(`Manufacturer: ${part.company_name || 'Various'} (CAGE: ${part.cage_code || 'N/A'})`);
      console.log(`\nGenerated Summary:`);
      console.log('-'.repeat(80));
      
      const summary = generateProfessionalSummary(part);
      console.log(summary);
      
      console.log(`\nCharacter count: ${summary.length}`);
      console.log(`Word count: ${summary.split(' ').length}`);
    }
    
    // Show estimated cost
    console.log(`\n${'='.repeat(80)}`);
    console.log('COST ANALYSIS:');
    console.log('- No external API calls required');
    console.log('- Template-based generation = $0 per summary');
    console.log('- Processing time: ~1ms per item');
    console.log('- Can process 1M+ items for just server costs');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
console.log('Starting summary generation test...');
testGeneration();