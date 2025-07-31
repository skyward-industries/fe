-- For partitioned tables, create indexes without CONCURRENTLY
-- These will be faster but may briefly lock the table

-- Check which tables are partitioned
SELECT schemaname, tablename, 
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_partitioned_table pt 
           WHERE pt.partrelid = c.oid
       ) THEN 'partitioned' ELSE 'regular' END as table_type
FROM pg_stat_user_tables st
JOIN pg_class c ON c.relname = st.tablename
WHERE tablename IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'freight_info', 'char_data', 'wp_fsgs_new');

-- For partitioned part_info table (faster, brief lock)
CREATE INDEX IF NOT EXISTS idx_part_info_nsn ON part_info (nsn);
CREATE INDEX IF NOT EXISTS idx_part_info_niin ON part_info (niin);
CREATE INDEX IF NOT EXISTS idx_part_info_fsg ON part_info (fsg);

-- For regular tables, continue with CONCURRENTLY
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_numbers_nsn ON part_numbers (nsn);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_numbers_cage_code ON part_numbers (cage_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_cage_addresses_cage_code ON wp_cage_addresses (cage_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freight_info_niin ON freight_info (niin);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_fsgs_new_fsg ON wp_fsgs_new (fsg);