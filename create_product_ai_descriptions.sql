CREATE TABLE IF NOT EXISTS product_ai_descriptions (
    nsn VARCHAR PRIMARY KEY,
    ai_summary TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW()
);
