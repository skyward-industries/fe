-- Optimize database indexes for sitemap generation
-- Run this script on your PostgreSQL database to improve sitemap query performance

-- Check existing indexes first
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('part_info', 'wp_fsgs_new')
ORDER BY tablename, indexname;

-- Create composite index for part_info table optimized for sitemap queries
-- This index covers the ID range query and includes necessary fields
CREATE INDEX IF NOT EXISTS idx_part_info_sitemap 
ON part_info(id, fsg, fsc, nsn) 
WHERE nsn IS NOT NULL AND nsn != '';

-- Create index for wp_fsgs_new to speed up joins
CREATE INDEX IF NOT EXISTS idx_wp_fsgs_new_fsg 
ON wp_fsgs_new(fsg) 
WHERE fsg_title IS NOT NULL AND fsc_title IS NOT NULL;

-- Create covering index for the most common sitemap query pattern
CREATE INDEX IF NOT EXISTS idx_part_info_sitemap_covering 
ON part_info(id) 
INCLUDE (fsg, fsc, nsn)
WHERE nsn IS NOT NULL AND nsn != '';

-- Analyze tables to update statistics
ANALYZE part_info;
ANALYZE wp_fsgs_new;

-- Check index usage after creating them
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('part_info', 'wp_fsgs_new')
ORDER BY idx_scan DESC;

-- Optional: Create partial indexes for specific ID ranges if you know your data distribution
-- Example for high ID ranges (adjust based on your actual data):
-- CREATE INDEX IF NOT EXISTS idx_part_info_high_ids 
-- ON part_info(id, fsg, fsc, nsn) 
-- WHERE id > 10000000 AND nsn IS NOT NULL AND nsn != '';

-- Monitor slow queries (requires pg_stat_statements extension)
-- Uncomment the following if you have pg_stat_statements enabled:
/*
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query LIKE '%part_info%' AND query LIKE '%BETWEEN%'
ORDER BY mean_time DESC
LIMIT 10;
*/

-- Check if pg_stat_statements is available
SELECT EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_stat_statements'
) AS pg_stat_statements_enabled;