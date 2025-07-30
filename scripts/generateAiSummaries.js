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

// Variation templates for different aspects
const variations = {
  intro: {
    aerospace: [
      "Essential for modern aviation systems,",
      "Critical to aerospace operations,",
      "Integral to aircraft functionality,",
      "Vital for aviation maintenance,",
      "Key component in aerospace applications,",
      "Fundamental to flight operations,",
      "Crucial for aircraft systems,",
      "Important for aerospace equipment,"
    ],
    defense: [
      "Essential for military operations,",
      "Critical to defense readiness,",
      "Vital for tactical systems,",
      "Key to military equipment functionality,",
      "Integral to defense logistics,",
      "Crucial for operational capability,",
      "Important for military maintenance,",
      "Fundamental to defense systems,"
    ],
    industrial: [
      "Essential for industrial operations,",
      "Critical to manufacturing processes,",
      "Vital for equipment maintenance,",
      "Key to operational efficiency,",
      "Integral to industrial systems,",
      "Crucial for production continuity,",
      "Important for facility operations,",
      "Fundamental to industrial applications,"
    ]
  },
  
  purpose: [
    "designed to meet exacting specifications",
    "engineered for reliable performance",
    "manufactured to precise tolerances",
    "built for demanding environments",
    "created for mission-critical applications",
    "developed for specialized requirements",
    "produced to industry standards",
    "crafted for professional use"
  ],
  
  quality: [
    "ensuring consistent performance",
    "delivering operational reliability",
    "providing dependable service",
    "maintaining high standards",
    "achieving optimal functionality",
    "supporting continuous operations",
    "enabling efficient performance",
    "facilitating reliable operation"
  ],
  
  procurement: [
    "Our procurement team specializes in",
    "We excel at sourcing",
    "Our supply chain experts handle",
    "We provide comprehensive support for",
    "Our logistics specialists manage",
    "We offer streamlined procurement of",
    "Our team facilitates acquisition of",
    "We ensure efficient sourcing of"
  ],
  
  benefits: [
    "competitive pricing and rapid fulfillment",
    "cost-effective solutions and timely delivery",
    "favorable terms and expedited shipping",
    "strategic sourcing and reliable supply",
    "optimal pricing and dependable logistics",
    "efficient procurement and fast turnaround",
    "value pricing and prompt service",
    "competitive rates and quick delivery"
  ]
};

// Hash function to generate consistent but varied selection
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Select variation based on NSN hash
function selectVariation(nsn, variations) {
  const hash = hashString(nsn);
  return variations[hash % variations.length];
}

// Generate unique summary based on part data
const generateProfessionalSummary = (part) => {
  const sections = [];
  
  // Determine category
  let category = 'industrial';
  const fsgNum = parseInt(part.fsg);
  if (fsgNum >= 10 && fsgNum <= 19) {
    category = 'defense';
  } else if ([15, 16, 17, 20, 25, 28, 29].includes(fsgNum)) {
    category = 'aerospace';
  }
  
  // Build unique introduction
  const intro = selectVariation(part.nsn, variations.intro[category]);
  const purpose = selectVariation(part.nsn + '1', variations.purpose);
  
  sections.push(`${intro} the ${part.item_name || 'component'} (NSN ${part.nsn}) is ${purpose}.`);
  
  // Add technical details with variations
  if (part.part_number) {
    const mfrVariations = [
      `Manufactured as part number ${part.part_number}`,
      `Identified by manufacturer part ${part.part_number}`,
      `Cataloged under part number ${part.part_number}`,
      `Referenced as ${part.part_number}`,
      `Designated ${part.part_number} by the manufacturer`
    ];
    sections.push(selectVariation(part.nsn + '2', mfrVariations) + 
      (part.cage_code ? ` with CAGE code ${part.cage_code}` : '') + '.');
  }
  
  // Classification with context
  if (part.fsc_title) {
    const classVariations = [
      `This item falls within the ${part.fsc_title} category`,
      `Classified under ${part.fsc_title}`,
      `Belonging to the ${part.fsc_title} classification`,
      `Categorized as ${part.fsc_title}`,
      `Part of the ${part.fsc_title} family`
    ];
    sections.push(selectVariation(part.nsn + '3', classVariations) + 
      `, ${selectVariation(part.nsn + '4', variations.quality)} in ${category} applications.`);
  }
  
  // Company-specific details
  if (part.company_name) {
    const companyVariations = [
      `${part.company_name} maintains strict quality controls`,
      `Production by ${part.company_name} ensures reliability`,
      `${part.company_name} brings expertise to manufacturing`,
      `With ${part.company_name} as the source`,
      `${part.company_name}'s commitment to excellence`
    ];
    sections.push(selectVariation(part.nsn + '5', companyVariations) + 
      ` for this ${part.unit_of_issue || 'item'}.`);
  }
  
  // Technical specifications vary by part
  const specs = [];
  if (part.unit_of_issue && part.unit_of_issue !== 'EA') {
    specs.push(`supplied in ${part.unit_of_issue}`);
  }
  if (part.shelf_life_code && !['0', 'NA'].includes(part.shelf_life_code)) {
    specs.push(`shelf-life code ${part.shelf_life_code}`);
  }
  if (part.aac) {
    specs.push(`acquisition advice ${part.aac}`);
  }
  
  if (specs.length > 0) {
    const specVariations = [
      `Technical specifications include`,
      `Key attributes encompass`,
      `Important characteristics feature`,
      `Notable specifications cover`,
      `Essential details include`
    ];
    sections.push(`${selectVariation(part.nsn + '6', specVariations)} ${specs.join(', ')}.`);
  }
  
  // End item usage if available
  if (part.end_item_name) {
    const endItemVariations = [
      `This component is used in`,
      `The item supports`,
      `Primarily utilized for`,
      `Designed for use with`,
      `This part integrates with`
    ];
    sections.push(`${selectVariation(part.nsn + '7', endItemVariations)} ${part.end_item_name.toLowerCase()} systems.`);
  }
  
  // Unique closing based on NSN
  const procurement = selectVariation(part.nsn + '8', variations.procurement);
  const benefits = selectVariation(part.nsn + '9', variations.benefits);
  
  sections.push(`${procurement} this NSN ${part.nsn} item, offering ${benefits}. Contact our team for current availability and detailed specifications.`);
  
  return sections.join(' ');
};

// Generate SEO-friendly meta description (shorter version)
const generateMetaDescription = (part) => {
  const company = part.company_name || 'verified suppliers';
  const itemName = part.item_name || 'component';
  const category = part.fsc_title || part.fsg_title || 'aerospace parts';
  
  return `Buy ${itemName} (NSN ${part.nsn}) from ${company}. Quality ${category} with CAGE Code ${part.cage_code || 'verification'}. Request quote for competitive pricing and fast delivery.`.substring(0, 160);
};

// Main function to generate summaries
async function generateSummaries() {
  const client = await pool.connect();
  
  try {
    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_ai_descriptions (
        nsn VARCHAR PRIMARY KEY,
        ai_summary TEXT NOT NULL,
        meta_description TEXT,
        generated_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Fetching parts data...');
    
    // Get all unique NSNs with their data
    const result = await client.query(`
      SELECT DISTINCT ON (pi.nsn)
        pi.nsn, pi.fsg, pi.fsc, pi.niin,
        fsgs.fsg_title, fsgs.fsc_title,
        pn.part_number, pn.cage_code,
        addr.company_name, addr.date_est,
        vfm.unit_of_issue, vfm.shelf_life_code, vfm.controlled_inventory_code,
        fi.nmf_desc AS nmfc_description, fi.uniform_freight_class,
        (SELECT item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS item_name,
        (SELECT end_item_name FROM public.nsn_with_inc WHERE nsn = pi.nsn LIMIT 1) AS end_item_name
      FROM public.part_info pi
      LEFT JOIN public.part_numbers pn ON pi.nsn = pn.nsn
      LEFT JOIN public.wp_cage_addresses addr ON pn.cage_code = addr.cage_code
      LEFT JOIN public.v_flis_management vfm ON pi.niin = vfm.niin
      LEFT JOIN public.wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
      LEFT JOIN public.freight_info fi ON pi.niin = fi.niin
      WHERE NOT EXISTS (
        SELECT 1 FROM public.product_ai_descriptions aid 
        WHERE aid.nsn = pi.nsn
      )
      ORDER BY pi.nsn, pn.part_number;
    `);
    
    console.log(`Found ${result.rows.length} parts to process...`);
    
    let processed = 0;
    let errors = 0;
    
    for (const part of result.rows) {
      try {
        // Get technical characteristics if available
        const charResult = await client.query(`
          SELECT mrc, requirements_statement, clear_text_reply 
          FROM public.char_data 
          WHERE niin = $1 
          LIMIT 5
        `, [part.niin]);
        
        part.characteristics = charResult.rows;
        
        // Generate summaries
        const aiSummary = generateProfessionalSummary(part);
        const metaDescription = generateMetaDescription(part);
        
        // Insert or update the summary
        await client.query(`
          INSERT INTO product_ai_descriptions (nsn, ai_summary, meta_description, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (nsn) 
          DO UPDATE SET 
            ai_summary = EXCLUDED.ai_summary,
            meta_description = EXCLUDED.meta_description,
            updated_at = NOW()
        `, [part.nsn, aiSummary, metaDescription]);
        
        processed++;
        
        if (processed % 100 === 0) {
          console.log(`Processed ${processed} parts...`);
        }
        
      } catch (err) {
        console.error(`Error processing NSN ${part.nsn}:`, err.message);
        errors++;
      }
    }
    
    console.log(`\nSummary generation complete!`);
    console.log(`Successfully processed: ${processed} parts`);
    console.log(`Errors: ${errors}`);
    
    // Show sample
    const sampleResult = await client.query(`
      SELECT nsn, ai_summary, meta_description 
      FROM product_ai_descriptions 
      LIMIT 3
    `);
    
    console.log('\nSample generated summaries:');
    sampleResult.rows.forEach((row, idx) => {
      console.log(`\n--- Sample ${idx + 1} (NSN: ${row.nsn}) ---`);
      console.log('Summary:', row.ai_summary.substring(0, 200) + '...');
      console.log('Meta:', row.meta_description);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the generator
console.log('Starting AI summary generation...');
generateSummaries();