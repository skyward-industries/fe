-- Additional indexes for optimizing high ID range queries
-- Run this after the main optimize_sitemap_indexes.sql

-- Create partial index for high ID ranges (adjust threshold based on your data)
CREATE INDEX IF NOT EXISTS idx_part_info_high_id_ranges 
ON part_info(id) 
WHERE id > 1000000 AND nsn IS NOT NULL AND nsn != '';

-- Create a BRIN index for very large ID ranges
-- BRIN indexes are very efficient for large sequential data
CREATE INDEX IF NOT EXISTS idx_part_info_id_brin 
ON part_info USING BRIN(id);

-- Create partial indexes for specific high ID ranges if you know the distribution
-- Example: If you have data clusters at certain ranges
CREATE INDEX IF NOT EXISTS idx_part_info_10m_plus 
ON part_info(id, fsg, fsc, nsn) 
WHERE id > 10000000 AND nsn IS NOT NULL AND nsn != '';

CREATE INDEX IF NOT EXISTS idx_part_info_50m_plus 
ON part_info(id, fsg, fsc, nsn) 
WHERE id > 50000000 AND nsn IS NOT NULL AND nsn != '';

-- Optimize the table for better performance
-- This will take time but improves query performance
VACUUM ANALYZE part_info;

-- Check the distribution of IDs to understand where the sparse ranges are
WITH id_distribution AS (
  SELECT 
    (id / 1000000) * 1000000 as id_range_start,
    COUNT(*) as count,
    MIN(id) as min_id,
    MAX(id) as max_id
  FROM part_info
  WHERE nsn IS NOT NULL AND nsn != ''
  GROUP BY (id / 1000000)
  ORDER BY id_range_start
)
SELECT 
  id_range_start,
  id_range_start + 999999 as id_range_end,
  count,
  min_id,
  max_id,
  max_id - min_id as id_spread
FROM id_distribution;

-- Set up table statistics for better query planning
ALTER TABLE part_info SET (autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE part_info SET (autovacuum_vacuum_scale_factor = 0.05);

-- Increase statistics target for the id column
ALTER TABLE part_info ALTER COLUMN id SET STATISTICS 1000;
ANALYZE part_info(id);

-- Check index sizes to ensure they're not too large
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||indexname)) AS index_size
FROM pg_indexes
WHERE tablename = 'part_info'
ORDER BY pg_total_relation_size(schemaname||'.'||indexname) DESC;