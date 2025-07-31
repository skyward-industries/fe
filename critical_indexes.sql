-- Critical indexes for immediate performance improvement
-- Run these one at a time to avoid locking issues

-- Most important: NSN lookups (used in WHERE clause)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_nsn_normalized ON part_info (REPLACE(nsn, '-', ''));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_nsn ON part_info (nsn);

-- JOIN indexes in order of importance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_numbers_nsn ON part_numbers (nsn);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_niin ON part_info (niin);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_numbers_cage_code ON part_numbers (cage_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_cage_addresses_cage_code ON wp_cage_addresses (cage_code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freight_info_niin ON freight_info (niin);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_char_data_niin ON char_data (niin);

-- FSG lookup optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_fsgs_new_fsg ON wp_fsgs_new (fsg);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_fsg ON part_info (fsg);

-- Update table statistics after creating indexes
ANALYZE part_info;
ANALYZE part_numbers;
ANALYZE wp_cage_addresses;
ANALYZE freight_info;
ANALYZE char_data;
ANALYZE wp_fsgs_new;