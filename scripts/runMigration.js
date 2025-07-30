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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running migration to add meta_description column...');
    
    // Add meta_description column
    await client.query(`
      ALTER TABLE product_ai_descriptions 
      ADD COLUMN IF NOT EXISTS meta_description TEXT
    `);
    
    console.log('Added meta_description column');
    
    // Add updated_at column
    await client.query(`
      ALTER TABLE product_ai_descriptions 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    
    console.log('Added updated_at column');
    
    // Verify the table structure
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product_ai_descriptions'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable structure after migration:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();