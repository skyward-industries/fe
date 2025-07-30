-- Add meta_description column to product_ai_descriptions table
ALTER TABLE product_ai_descriptions 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE product_ai_descriptions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();