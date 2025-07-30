-- Create a materialized view for ultra-fast sitemap queries
CREATE MATERIALIZED VIEW IF NOT EXISTS sitemap_parts_mv AS
SELECT 
  pi.id,
  pi.fsg,
  pi.fsc,
  pi.nsn,
  COALESCE(fsgs.fsg_title, '') as fsg_title,
  COALESCE(fsgs.fsc_title, '') as fsc_title
FROM part_info pi
LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
WHERE pi.nsn IS NOT NULL AND pi.nsn != '';

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS sitemap_parts_mv_id_idx ON sitemap_parts_mv(id);
CREATE INDEX IF NOT EXISTS sitemap_parts_mv_nsn_idx ON sitemap_parts_mv(nsn);

-- Refresh the materialized view (run this periodically)
-- REFRESH MATERIALIZED VIEW sitemap_parts_mv;
