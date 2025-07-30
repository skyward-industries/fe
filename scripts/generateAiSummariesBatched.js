import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

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

// Batch configuration
const BATCH_SIZE = 10000; // Process 10000 NSNs at a time
const CHECKPOINT_FILE = './summary_generation_checkpoint.json';

// Variation templates (copying from original script)
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
  quality: [
    "high-quality",
    "premium-grade",
    "specification-compliant",
    "certified",
    "authentic",
    "OEM-standard",
    "military-grade",
    "industrial-strength",
    "precision-engineered",
    "rigorously tested"
  ],
  delivery: [
    "fast shipping",
    "expedited delivery",
    "rapid fulfillment",
    "quick turnaround",
    "prompt dispatch",
    "efficient logistics",
    "reliable shipping",
    "timely delivery"
  ],
  service: [
    "exceptional customer service",
    "dedicated support",
    "expert assistance",
    "professional guidance",
    "responsive support team",
    "knowledgeable staff",
    "customer-focused service",
    "technical expertise"
  ]
};

// Helper functions from original script
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function selectVariation(variations, seed) {
  const hash = hashString(seed);
  return variations[hash % variations.length];
}

function determineCategory(part) {
  const fsgTitle = (part.fsg_title || '').toLowerCase();
  const fscTitle = (part.fsc_title || '').toLowerCase();
  const itemName = (part.item_name || '').toLowerCase();
  
  if (fsgTitle.includes('aircraft') || fsgTitle.includes('aerospace') || 
      fscTitle.includes('aircraft') || itemName.includes('aircraft')) {
    return 'aerospace';
  } else if (fsgTitle.includes('weapon') || fsgTitle.includes('ammun') || 
             fscTitle.includes('combat') || itemName.includes('military')) {
    return 'defense';
  } else {
    return 'industrial';
  }
}

function generateProfessionalSummary(part) {
  const category = determineCategory(part);
  const itemName = part.item_name || `NSN ${part.nsn} component`;
  const fscTitle = part.fsc_title || part.fsg_title || 'equipment';
  const company = part.company_name || 'Skyward Industries';
  
  const intro = selectVariation(variations.intro[category], part.nsn);
  const quality = selectVariation(variations.quality, part.nsn + '1');
  const delivery = selectVariation(variations.delivery, part.nsn + '2');
  const service = selectVariation(variations.service, part.nsn + '3');
  
  const sections = [
    `${intro} this ${itemName} serves as a ${quality} solution for ${fscTitle} applications.`,
    `With National Stock Number ${part.nsn}, this item meets stringent quality standards and specifications required for professional use.`,
    part.part_number ? `Part number ${part.part_number} is manufactured to exacting tolerances, ensuring reliable performance in demanding environments.` : null,
    part.cage_code ? `CAGE Code ${part.cage_code} verification ensures authenticity and compliance with procurement requirements.` : null,
    `Skyward Industries provides ${delivery} and ${service} for all your ${category} parts needs.`,
    part.unit_of_issue ? `Available in ${part.unit_of_issue} units for flexible ordering options.` : null
  ].filter(Boolean);
  
  return sections.join(' ');
}

function generateMetaDescription(part) {
  const itemName = part.item_name || `NSN ${part.nsn}`;
  const company = part.company_name || 'verified suppliers';
  const category = determineCategory(part);
  
  return `Buy ${itemName} (NSN ${part.nsn}) from ${company}. Quality ${category} with CAGE Code ${part.cage_code || 'verification'}. Request quote for competitive pricing and fast delivery.`.substring(0, 160);
}

// Load checkpoint if exists
function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading checkpoint:', error);
  }
  return { lastProcessedNSN: null, totalProcessed: 0, totalErrors: 0 };
}

// Save checkpoint
function saveCheckpoint(checkpoint) {
  try {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
  } catch (error) {
    console.error('Error saving checkpoint:', error);
  }
}

async function processBatch(client, parts, checkpoint) {
  let processed = 0;
  let errors = 0;
  
  for (const part of parts) {
    try {
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
      checkpoint.lastProcessedNSN = part.nsn;
      
    } catch (err) {
      console.error(`Error processing NSN ${part.nsn}:`, err.message);
      errors++;
    }
  }
  
  return { processed, errors };
}

async function main() {
  const client = await pool.connect();
  const checkpoint = loadCheckpoint();
  
  try {
    console.log('Starting AI summary generation (batched)...');
    console.log(`Batch size: ${BATCH_SIZE}`);
    if (checkpoint.lastProcessedNSN) {
      console.log(`Resuming from NSN: ${checkpoint.lastProcessedNSN}`);
      console.log(`Previously processed: ${checkpoint.totalProcessed}`);
    }
    
    let hasMore = true;
    let totalProcessed = checkpoint.totalProcessed;
    let totalErrors = checkpoint.totalErrors;
    
    while (hasMore) {
      // Get next batch of parts
      const whereClause = checkpoint.lastProcessedNSN 
        ? `AND pi.nsn > '${checkpoint.lastProcessedNSN}'`
        : '';
      
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
        ${whereClause}
        ORDER BY pi.nsn
        LIMIT ${BATCH_SIZE}
      `);
      
      if (result.rows.length === 0) {
        hasMore = false;
        console.log('No more parts to process!');
        break;
      }
      
      console.log(`\nProcessing batch of ${result.rows.length} parts...`);
      const batchResult = await processBatch(client, result.rows, checkpoint);
      
      totalProcessed += batchResult.processed;
      totalErrors += batchResult.errors;
      
      // Update and save checkpoint
      checkpoint.totalProcessed = totalProcessed;
      checkpoint.totalErrors = totalErrors;
      saveCheckpoint(checkpoint);
      
      console.log(`Batch complete. Total processed: ${totalProcessed}, Total errors: ${totalErrors}`);
      
      // Add a small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\nSummary generation complete!`);
    console.log(`Total successfully processed: ${totalProcessed} parts`);
    console.log(`Total errors: ${totalErrors}`);
    
    // Clean up checkpoint file on successful completion
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
      console.log('Checkpoint file removed.');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    // Save checkpoint before exiting
    saveCheckpoint(checkpoint);
    console.log('Checkpoint saved. You can resume by running the script again.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);