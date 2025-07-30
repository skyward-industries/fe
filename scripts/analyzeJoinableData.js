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

async function analyzeJoinableData() {
  const client = await pool.connect();
  
  try {
    console.log('=== DETAILED ANALYSIS OF JOINABLE DATA ===\n');
    
    // 1. Analyze related_nsns table
    console.log('1. RELATED NSNs TABLE:');
    console.log('-'.repeat(70));
    
    const relatedNsnsSample = await client.query(`
      SELECT nsn, related_nsn, COUNT(*) OVER (PARTITION BY nsn) as related_count
      FROM public.related_nsns
      WHERE nsn IN (
        SELECT nsn FROM public.part_info LIMIT 5
      )
      LIMIT 10;
    `);
    
    console.log('Sample related NSNs:');
    relatedNsnsSample.rows.forEach(row => {
      console.log(`  NSN ${row.nsn} -> Related NSN: ${row.related_nsn} (${row.related_count} total related)`);
    });
    
    // 2. Analyze MRC codes and their meanings
    console.log('\n\n2. MRC CODE MEANINGS (Material Requirement Codes):');
    console.log('-'.repeat(70));
    
    const mrcExamples = await client.query(`
      SELECT DISTINCT mrc, requirements_statement, COUNT(*) as usage_count
      FROM public.char_data
      WHERE mrc IN ('AGAV', 'FEAT', 'CXCY', 'MATT', 'TEXT', 'ABHP', 'STYL', 'CRTL', 'ABMK')
      GROUP BY mrc, requirements_statement
      ORDER BY mrc, usage_count DESC;
    `);
    
    const mrcMap = {};
    mrcExamples.rows.forEach(row => {
      if (!mrcMap[row.mrc]) {
        mrcMap[row.mrc] = row.requirements_statement;
      }
    });
    
    console.log('MRC Code meanings:');
    Object.entries(mrcMap).forEach(([code, meaning]) => {
      console.log(`  ${code}: ${meaning}`);
    });
    
    // 3. Analyze hazardous material codes
    console.log('\n\n3. HAZARDOUS MATERIAL CODES:');
    console.log('-'.repeat(70));
    
    const hazmatStructure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'wp_hazardous_material_codes'
      ORDER BY ordinal_position
      LIMIT 10;
    `);
    
    console.log('Hazardous material code columns:');
    hazmatStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // 4. Analyze related_h6 (INC relationships)
    console.log('\n\n4. RELATED H6 (INC RELATIONSHIPS):');
    console.log('-'.repeat(70));
    
    const h6Structure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'related_h6'
      ORDER BY ordinal_position;
    `);
    
    console.log('related_h6 columns:');
    h6Structure.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Sample H6 relationships
    const h6Sample = await client.query(`
      SELECT inc, related_inc, COUNT(*) OVER (PARTITION BY inc) as related_count
      FROM public.related_h6
      LIMIT 5;
    `);
    
    console.log('\nSample H6 relationships:');
    h6Sample.rows.forEach(row => {
      console.log(`  INC ${row.inc} -> Related INC: ${row.related_inc} (${row.related_count} total related)`);
    });
    
    // 5. Check v_h6_name_inc for INC details
    console.log('\n\n5. H6 NAME INC VIEW:');
    console.log('-'.repeat(70));
    
    const h6NameSample = await client.query(`
      SELECT *
      FROM public.v_h6_name_inc
      LIMIT 3;
    `);
    
    console.log('Sample H6 name data:');
    h6NameSample.rows.forEach((row, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (value) console.log(`  ${key}: ${value}`);
      });
    });
    
    // 6. Analyze additional characteristics data
    console.log('\n\n6. UNIQUE CHARACTERISTIC TYPES:');
    console.log('-'.repeat(70));
    
    const charTypes = await client.query(`
      SELECT DISTINCT mrc, requirements_statement, COUNT(*) as count
      FROM public.char_data
      WHERE niin IN (
        SELECT niin FROM public.part_info LIMIT 1000
      )
      GROUP BY mrc, requirements_statement
      ORDER BY count DESC
      LIMIT 20;
    `);
    
    console.log('Top characteristic types in your data:');
    charTypes.rows.forEach(row => {
      console.log(`  ${row.mrc}: ${row.requirements_statement} (${row.count} items)`);
    });
    
    // 7. Check for additional code tables
    console.log('\n\n7. ACTIVITY CODE ORIGINATORS:');
    console.log('-'.repeat(70));
    
    const activityCodes = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'wp_activity_code_originators'
      ORDER BY ordinal_position;
    `);
    
    console.log('Activity code originator columns:');
    activityCodes.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });
    
    // 8. Sample comprehensive join
    console.log('\n\n8. COMPREHENSIVE DATA EXAMPLE:');
    console.log('-'.repeat(70));
    
    const comprehensiveExample = await client.query(`
      SELECT 
        pi.nsn,
        ni.inc,
        ni.item_name,
        ni.end_item_name,
        cd.mrc,
        cd.requirements_statement,
        cd.clear_text_reply,
        (SELECT COUNT(*) FROM public.related_nsns WHERE nsn = pi.nsn) as related_nsn_count,
        (SELECT COUNT(*) FROM public.char_data WHERE niin = pi.niin) as characteristic_count
      FROM public.part_info pi
      LEFT JOIN public.nsn_with_inc ni ON pi.nsn = ni.nsn
      LEFT JOIN public.char_data cd ON pi.niin = cd.niin
      WHERE pi.nsn IS NOT NULL
        AND ni.item_name IS NOT NULL
      LIMIT 1;
    `);
    
    console.log('Example of enriched NSN data:');
    comprehensiveExample.rows.forEach(row => {
      console.log('\nNSN:', row.nsn);
      console.log('INC:', row.inc);
      console.log('Item Name:', row.item_name);
      console.log('End Item:', row.end_item_name);
      console.log('Characteristic:', row.mrc, '-', row.requirements_statement);
      console.log('Value:', row.clear_text_reply);
      console.log('Related NSNs:', row.related_nsn_count);
      console.log('Total Characteristics:', row.characteristic_count);
    });
    
  } catch (error) {
    console.error('Error analyzing joinable data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the analysis
console.log('Starting joinable data analysis...\n');
analyzeJoinableData();