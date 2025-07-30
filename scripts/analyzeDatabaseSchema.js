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

async function analyzeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('=== DATABASE SCHEMA ANALYSIS ===\n');
    
    // 1. Find all tables that might contain NSN or NIIN data
    console.log('1. TABLES WITH NSN/NIIN COLUMNS:');
    console.log('-'.repeat(50));
    
    const nsnTables = await client.query(`
      SELECT DISTINCT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (column_name LIKE '%nsn%' OR column_name LIKE '%niin%')
      ORDER BY table_name, column_name;
    `);
    
    console.log('Tables with NSN/NIIN references:');
    nsnTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}.${row.column_name}`);
    });
    
    // 2. Find tables with INC (Item Name Code) data
    console.log('\n\n2. TABLES WITH INC DATA:');
    console.log('-'.repeat(50));
    
    const incTables = await client.query(`
      SELECT DISTINCT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name LIKE '%inc%'
      ORDER BY table_name;
    `);
    
    console.log('Tables with INC columns:');
    incTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}.${row.column_name}`);
    });
    
    // 3. Find lookup/reference tables (tables with 'code' in name)
    console.log('\n\n3. POTENTIAL LOOKUP TABLES:');
    console.log('-'.repeat(50));
    
    const lookupTables = await client.query(`
      SELECT DISTINCT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (
          table_name LIKE '%code%' 
          OR table_name LIKE '%lookup%'
          OR table_name LIKE '%ref%'
          OR table_name LIKE '%dict%'
        )
      ORDER BY table_name;
    `);
    
    console.log('Potential lookup tables:');
    lookupTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 4. Analyze char_data table structure
    console.log('\n\n4. CHAR_DATA TABLE ANALYSIS:');
    console.log('-'.repeat(50));
    
    const charColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'char_data'
      ORDER BY ordinal_position;
    `);
    
    console.log('char_data columns:');
    charColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Sample char_data to understand MRC codes
    const mrcSample = await client.query(`
      SELECT DISTINCT mrc, COUNT(*) as count
      FROM public.char_data
      WHERE mrc IS NOT NULL
      GROUP BY mrc
      ORDER BY count DESC
      LIMIT 10;
    `);
    
    console.log('\nTop MRC codes in char_data:');
    mrcSample.rows.forEach(row => {
      console.log(`  - ${row.mrc}: ${row.count} records`);
    });
    
    // 5. Find tables with additional part attributes
    console.log('\n\n5. TABLES WITH PART ATTRIBUTES:');
    console.log('-'.repeat(50));
    
    const attrTables = await client.query(`
      SELECT DISTINCT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          column_name LIKE '%spec%'
          OR column_name LIKE '%attr%'
          OR column_name LIKE '%char%'
          OR column_name LIKE '%prop%'
          OR column_name LIKE '%feature%'
        )
        AND table_name NOT IN ('pg_stat_statements')
      ORDER BY table_name, column_name
      LIMIT 20;
    `);
    
    console.log('Tables with attribute columns:');
    attrTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}.${row.column_name}`);
    });
    
    // 6. Check for replacement/supersession data
    console.log('\n\n6. REPLACEMENT/SUPERSESSION DATA:');
    console.log('-'.repeat(50));
    
    const replTables = await client.query(`
      SELECT DISTINCT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          column_name LIKE '%replac%'
          OR column_name LIKE '%superced%'
          OR column_name LIKE '%obsol%'
          OR column_name LIKE '%alternate%'
        )
      ORDER BY table_name;
    `);
    
    console.log('Tables with replacement data:');
    replTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}.${row.column_name}`);
    });
    
    // 7. Find all columns in part_info table
    console.log('\n\n7. PART_INFO TABLE STRUCTURE:');
    console.log('-'.repeat(50));
    
    const partInfoCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'part_info'
      ORDER BY ordinal_position;
    `);
    
    console.log('part_info columns:');
    partInfoCols.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // 8. Find related items tables
    console.log('\n\n8. RELATED ITEMS TABLES:');
    console.log('-'.repeat(50));
    
    const relatedTables = await client.query(`
      SELECT DISTINCT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (
          table_name LIKE '%related%'
          OR table_name LIKE '%cross%'
          OR table_name LIKE '%alternate%'
          OR table_name LIKE '%compatible%'
        )
      ORDER BY table_name;
    `);
    
    console.log('Tables for related items:');
    relatedTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 9. Sample nsn_with_inc to see what columns exist
    console.log('\n\n9. NSN_WITH_INC TABLE STRUCTURE:');
    console.log('-'.repeat(50));
    
    const nsnIncCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'nsn_with_inc'
      ORDER BY ordinal_position;
    `);
    
    console.log('nsn_with_inc columns:');
    nsnIncCols.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // 10. Check for any H-codes or other code tables
    console.log('\n\n10. CODE REFERENCE TABLES:');
    console.log('-'.repeat(50));
    
    const codeTables = await client.query(`
      SELECT DISTINCT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (
          table_name LIKE '%_code'
          OR table_name LIKE '%_codes'
          OR table_name LIKE 'h_%'
          OR table_name LIKE '%reference%'
        )
      ORDER BY table_name;
    `);
    
    console.log('Code reference tables:');
    codeTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error analyzing database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the analysis
console.log('Starting database analysis...\n');
analyzeDatabase();