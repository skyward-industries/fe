#!/usr/bin/env node

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Database connection
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

async function findINCRelationships() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Finding tables with INC columns...\n');
    
    // Find all tables with INC columns
    const incTablesQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name ILIKE '%inc%'
        AND table_name NOT IN ('nsn_with_inc') -- We already know about this one
      ORDER BY table_name, column_name;
    `;
    
    const incTablesResult = await client.query(incTablesQuery);
    
    console.log('Tables with INC-related columns:');
    console.log('─'.repeat(80));
    
    const tableGroups = {};
    incTablesResult.rows.forEach(row => {
      if (!tableGroups[row.table_name]) {
        tableGroups[row.table_name] = [];
      }
      tableGroups[row.table_name].push(row);
    });
    
    for (const [tableName, columns] of Object.entries(tableGroups)) {
      console.log(`\n📋 Table: ${tableName}`);
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Get sample data from each table
      try {
        const sampleQuery = `SELECT * FROM ${tableName} LIMIT 3;`;
        const sampleResult = await client.query(sampleQuery);
        
        if (sampleResult.rows.length > 0) {
          console.log(`   Sample data columns: ${Object.keys(sampleResult.rows[0]).join(', ')}`);
        }
      } catch (e) {
        console.log(`   Could not get sample data: ${e.message}`);
      }
    }
    
    // Look specifically for INC definition or master tables
    console.log('\n\n🔍 Looking for INC master/definition tables...\n');
    
    const incMasterQuery = `
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND (
          table_name ILIKE '%inc%' 
          OR (column_name = 'inc' AND table_name NOT IN ('nsn_with_inc'))
        )
      ORDER BY table_name;
    `;
    
    const incMasterResult = await client.query(incMasterQuery);
    
    console.log('Potential INC master tables:');
    incMasterResult.rows.forEach(row => {
      console.log(`   ${row.table_name}.${row.column_name}`);
    });
    
    // Check for the specific INC 77777
    console.log('\n\n🔍 Checking data for INC 77777 (BLOWER ASSEMBLY)...\n');
    
    const checkINC = '77777';
    
    // Check nsn_with_inc first
    const nsnIncQuery = `
      SELECT COUNT(*) as count, 
             MIN(item_name) as sample_item_name
      FROM nsn_with_inc 
      WHERE inc = $1;
    `;
    
    const nsnIncResult = await client.query(nsnIncQuery, [checkINC]);
    console.log(`nsn_with_inc: ${nsnIncResult.rows[0].count} records with INC ${checkINC}`);
    console.log(`Sample item name: ${nsnIncResult.rows[0].sample_item_name}`);
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

findINCRelationships();