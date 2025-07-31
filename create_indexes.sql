-- Create indexes for part_info table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_nsn ON part_info (nsn);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_niin ON part_info (niin);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_fsg ON part_info (fsg);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_fsc ON part_info (fsc);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_info_nsn_normalized ON part_info (REPLACE(nsn, '-', ''));

-- Create indexes for part_numbers table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_numbers_nsn ON part_numbers (nsn);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_part_numbers_cage_code ON part_numbers (cage_code);

-- Create indexes for wp_cage_addresses table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_cage_addresses_cage_code ON wp_cage_addresses (cage_code);

-- Create indexes for freight_info table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_freight_info_niin ON freight_info (niin);

-- Create indexes for char_data table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_char_data_niin ON char_data (niin);

-- Create indexes for wp_fsgs_new table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_fsgs_new_fsg ON wp_fsgs_new (fsg);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wp_fsgs_new_fsg_fsc ON wp_fsgs_new (fsg, fsc);

-- Analyze tables after creating indexes
ANALYZE part_info;
ANALYZE part_numbers;
ANALYZE wp_cage_addresses;
ANALYZE freight_info;
ANALYZE char_data;
ANALYZE wp_fsgs_new;