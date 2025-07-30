-- Critical indexes for fast sitemap queries
CREATE INDEX IF NOT EXISTS part_info_id_idx ON part_info(id);
CREATE INDEX IF NOT EXISTS wp_fsgs_new_fsg_fsc_idx ON wp_fsgs_new(fsg, fsc);
CREATE INDEX IF NOT EXISTS part_info_nsn_idx ON part_info(nsn);
CREATE INDEX IF NOT EXISTS part_info_fsg_fsc_idx ON part_info(fsg, fsc);

-- Composite index for the exact query pattern
CREATE INDEX IF NOT EXISTS part_info_sitemap_idx ON part_info(id, fsg, fsc, nsn) 
WHERE nsn IS NOT NULL AND nsn != '';

-- Analyze tables to update statistics
ANALYZE part_info;
ANALYZE wp_fsgs_new;
