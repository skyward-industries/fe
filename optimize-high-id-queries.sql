-- Database optimizations for faster high ID range queries
-- Run these commands on your PostgreSQL database

-- 1. Create a partial index for high ID ranges with non-null NSNs
-- This will significantly speed up queries for IDs > 2.8M
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_high_id_nsn 
ON part_info(id, fsg, fsc, nsn) 
WHERE id > 2800000 AND nsn IS NOT NULL AND nsn != '';

-- 2. Create a covering index for the standard query pattern
-- This allows index-only scans for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_id_covering 
ON part_info(id, fsg, fsc, nsn) 
WHERE nsn IS NOT NULL AND nsn != '';

-- 3. Update table statistics for better query planning
ANALYZE part_info;

-- 4. Create a materialized view for high ID ranges (optional but very effective)
-- This pre-computes results for faster access
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_high_id_sitemap_parts AS
SELECT 
    pi.id,
    pi.fsg,
    pi.fsc,
    pi.nsn,
    fsgs.fsg_title,
    fsgs.fsc_title
FROM part_info pi
INNER JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
WHERE pi.id > 2800000 
    AND pi.nsn IS NOT NULL 
    AND pi.nsn != ''
    AND fsgs.fsg_title IS NOT NULL 
    AND fsgs.fsc_title IS NOT NULL
ORDER BY pi.id;

-- Create index on the materialized view
CREATE INDEX idx_mv_high_id_sitemap_id ON mv_high_id_sitemap_parts(id);

-- 5. Partition the part_info table by ID ranges (more complex but very effective)
-- This is a bigger change that requires careful planning
-- Example partitioning strategy:
/*
-- Create partitioned table
CREATE TABLE part_info_partitioned (LIKE part_info INCLUDING ALL) PARTITION BY RANGE (id);

-- Create partitions
CREATE TABLE part_info_p0 PARTITION OF part_info_partitioned FOR VALUES FROM (1) TO (1000000);
CREATE TABLE part_info_p1 PARTITION OF part_info_partitioned FOR VALUES FROM (1000000) TO (2000000);
CREATE TABLE part_info_p2 PARTITION OF part_info_partitioned FOR VALUES FROM (2000000) TO (3000000);
CREATE TABLE part_info_p3 PARTITION OF part_info_partitioned FOR VALUES FROM (3000000) TO (4000000);
CREATE TABLE part_info_p4 PARTITION OF part_info_partitioned FOR VALUES FROM (4000000) TO (5000000);
CREATE TABLE part_info_p5 PARTITION OF part_info_partitioned FOR VALUES FROM (5000000) TO (10000000);
CREATE TABLE part_info_p6 PARTITION OF part_info_partitioned FOR VALUES FROM (10000000) TO (100000000);

-- Migrate data (this will take time)
INSERT INTO part_info_partitioned SELECT * FROM part_info;

-- Rename tables
ALTER TABLE part_info RENAME TO part_info_old;
ALTER TABLE part_info_partitioned RENAME TO part_info;
*/

-- 6. Tune PostgreSQL configuration for better performance
-- Add these to postgresql.conf or set at session level:
/*
-- Increase work memory for complex queries
work_mem = '256MB'

-- Increase shared buffers if you have enough RAM
shared_buffers = '4GB'

-- Enable parallel queries
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

-- Optimize for SSDs if applicable
random_page_cost = 1.1
effective_io_concurrency = 200
*/

-- 7. Create a summary table for empty ranges (quick lookups)
CREATE TABLE IF NOT EXISTS empty_id_ranges (
    start_id BIGINT NOT NULL,
    end_id BIGINT NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (start_id, end_id)
);

-- Populate with known empty ranges
INSERT INTO empty_id_ranges (start_id, end_id) VALUES
    (3000000, 5000000),
    (5500000, 10000000),
    (15000000, 20000000),
    (25000000, 50000000),
    (60000000, 100000000),
    (4300000, 4400000)
ON CONFLICT DO NOTHING;

-- 8. Create a function for fast empty range detection
CREATE OR REPLACE FUNCTION is_range_empty(start_id BIGINT, end_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check empty ranges table first
    IF EXISTS (
        SELECT 1 FROM empty_id_ranges 
        WHERE start_id >= empty_id_ranges.start_id 
        AND end_id <= empty_id_ranges.end_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Quick existence check
    RETURN NOT EXISTS (
        SELECT 1 FROM part_info 
        WHERE id >= start_id 
        AND id <= end_id 
        AND nsn IS NOT NULL 
        AND nsn != ''
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Vacuum and reindex for optimal performance
VACUUM ANALYZE part_info;
REINDEX TABLE part_info;

-- 10. Monitor slow queries to identify other bottlenecks
-- Enable slow query logging in postgresql.conf:
/*
log_min_duration_statement = 1000  -- Log queries slower than 1 second
*/