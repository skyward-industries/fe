-- PostgreSQL Table Partitioning Migration Script
-- This script partitions the part_info table by ID ranges
-- Designed for zero-downtime migration

-- STEP 1: Create the new partitioned table structure
BEGIN;

-- Create parent partitioned table with same structure as original
CREATE TABLE part_info_new (LIKE part_info INCLUDING ALL) PARTITION BY RANGE (id);

-- Add primary key constraint if it doesn't exist
ALTER TABLE part_info_new ADD PRIMARY KEY (id);

-- Create partitions based on data distribution
CREATE TABLE part_info_p1 PARTITION OF part_info_new 
    FOR VALUES FROM (1) TO (500001);

CREATE TABLE part_info_p2 PARTITION OF part_info_new 
    FOR VALUES FROM (500001) TO (1000001);

CREATE TABLE part_info_p3 PARTITION OF part_info_new 
    FOR VALUES FROM (1000001) TO (2000001);

CREATE TABLE part_info_p4 PARTITION OF part_info_new 
    FOR VALUES FROM (2000001) TO (3000001);

CREATE TABLE part_info_p5 PARTITION OF part_info_new 
    FOR VALUES FROM (3000001) TO (4000001);

CREATE TABLE part_info_p6 PARTITION OF part_info_new 
    FOR VALUES FROM (4000001) TO (5000001);
    
CREATE TABLE part_info_p7 PARTITION OF part_info_new 
    FOR VALUES FROM (5000001) TO (10000001);

CREATE TABLE part_info_p8 PARTITION OF part_info_new 
    FOR VALUES FROM (10000001) TO (100000001);

-- Create a default partition for any future data
CREATE TABLE part_info_default PARTITION OF part_info_new DEFAULT;

COMMIT;

-- STEP 2: Create optimized indexes on each partition
-- Smaller partitions = faster index creation

-- For active partitions (p1-p4), create standard indexes
CREATE INDEX CONCURRENTLY idx_part_info_p1_nsn ON part_info_p1(nsn) WHERE nsn IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_part_info_p1_id_fsg_fsc ON part_info_p1(id, fsg, fsc);

CREATE INDEX CONCURRENTLY idx_part_info_p2_nsn ON part_info_p2(nsn) WHERE nsn IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_part_info_p2_id_fsg_fsc ON part_info_p2(id, fsg, fsc);

CREATE INDEX CONCURRENTLY idx_part_info_p3_nsn ON part_info_p3(nsn) WHERE nsn IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_part_info_p3_id_fsg_fsc ON part_info_p3(id, fsg, fsc);

CREATE INDEX CONCURRENTLY idx_part_info_p4_nsn ON part_info_p4(nsn) WHERE nsn IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_part_info_p4_id_fsg_fsc ON part_info_p4(id, fsg, fsc);

-- For sparse partitions (p5-p8), create covering indexes for sitemap queries
CREATE INDEX CONCURRENTLY idx_part_info_p5_sitemap ON part_info_p5(id, fsg, fsc, nsn) 
    WHERE nsn IS NOT NULL AND nsn != '';

CREATE INDEX CONCURRENTLY idx_part_info_p6_sitemap ON part_info_p6(id, fsg, fsc, nsn) 
    WHERE nsn IS NOT NULL AND nsn != '';

CREATE INDEX CONCURRENTLY idx_part_info_p7_sitemap ON part_info_p7(id, fsg, fsc, nsn) 
    WHERE nsn IS NOT NULL AND nsn != '';

CREATE INDEX CONCURRENTLY idx_part_info_p8_sitemap ON part_info_p8(id, fsg, fsc, nsn) 
    WHERE nsn IS NOT NULL AND nsn != '';

-- STEP 3: Copy data in batches (can be done online)
-- This approach minimizes locking and allows monitoring progress

-- Function to copy data in batches
CREATE OR REPLACE FUNCTION copy_partition_data(
    start_id BIGINT, 
    end_id BIGINT, 
    batch_size INT DEFAULT 10000
) RETURNS void AS $$
DECLARE
    current_id BIGINT := start_id;
    rows_copied BIGINT;
BEGIN
    WHILE current_id < end_id LOOP
        -- First check if there's a primary key for ON CONFLICT
        IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'part_info_new'::regclass 
            AND contype = 'p'
        ) THEN
            -- Use ON CONFLICT if primary key exists
            INSERT INTO part_info_new 
            SELECT * FROM part_info 
            WHERE id >= current_id 
            AND id < LEAST(current_id + batch_size, end_id)
            ON CONFLICT (id) DO NOTHING;
        ELSE
            -- Use NOT EXISTS if no primary key
            INSERT INTO part_info_new 
            SELECT * FROM part_info p
            WHERE p.id >= current_id 
            AND p.id < LEAST(current_id + batch_size, end_id)
            AND NOT EXISTS (
                SELECT 1 FROM part_info_new pn WHERE pn.id = p.id
            );
        END IF;
        
        GET DIAGNOSTICS rows_copied = ROW_COUNT;
        RAISE NOTICE 'Copied % rows for IDs % to %', 
            rows_copied, current_id, LEAST(current_id + batch_size, end_id);
        
        current_id := current_id + batch_size;
        
        -- Brief pause to reduce load
        PERFORM pg_sleep(0.1);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Copy data for each partition range
-- Run these one at a time and monitor server load
SELECT copy_partition_data(1, 500001);
SELECT copy_partition_data(500001, 1000001);
SELECT copy_partition_data(1000001, 2000001);
SELECT copy_partition_data(2000001, 3000001);
SELECT copy_partition_data(3000001, 4000001);
SELECT copy_partition_data(4000001, 5000001);
SELECT copy_partition_data(5000001, 10000001);
SELECT copy_partition_data(10000001, 100000001);

-- STEP 4: Verify data integrity
SELECT 'Original table count:', COUNT(*) FROM part_info
UNION ALL
SELECT 'New table count:', COUNT(*) FROM part_info_new;

-- Verify specific ranges
SELECT 'Partition p6 (4M-5M) count:', COUNT(*) FROM part_info_p6;

-- STEP 5: Switch tables (requires brief downtime)
BEGIN;

-- Rename tables
ALTER TABLE part_info RENAME TO part_info_old;
ALTER TABLE part_info_new RENAME TO part_info;

-- Recreate any foreign keys, triggers, etc. that reference part_info

COMMIT;

-- STEP 6: Update table statistics
ANALYZE part_info;

-- STEP 7: Test query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT fsg, fsc, nsn, fsg_title, fsc_title
FROM part_info pi
JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
WHERE pi.id >= 4365000 AND pi.id <= 4368000
AND pi.nsn IS NOT NULL
ORDER BY pi.id
LIMIT 3000;

-- STEP 8: Clean up (after verifying everything works)
-- DROP TABLE part_info_old;
-- DROP FUNCTION copy_partition_data(BIGINT, BIGINT, INT);

-- MAINTENANCE: Set up automatic VACUUM and ANALYZE for partitions
ALTER TABLE part_info_p1 SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE part_info_p2 SET (autovacuum_vacuum_scale_factor = 0.1);
-- Sparse partitions can have less frequent maintenance
ALTER TABLE part_info_p6 SET (autovacuum_vacuum_scale_factor = 0.2);
ALTER TABLE part_info_p7 SET (autovacuum_vacuum_scale_factor = 0.2);
ALTER TABLE part_info_p8 SET (autovacuum_vacuum_scale_factor = 0.2);