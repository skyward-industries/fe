-- Specific optimizations for the 2.8M+ ID range where timeouts occur
-- Run this to fix timeout issues around 2.8 million IDs

-- Create a partial index specifically for the problematic range
CREATE INDEX IF NOT EXISTS idx_part_info_2_8m_range 
ON part_info(id, nsn) 
WHERE id >= 2800000 AND id <= 5000000 AND nsn IS NOT NULL;

-- Create a BRIN index if not already exists (very efficient for large ranges)
CREATE INDEX IF NOT EXISTS idx_part_info_id_brin 
ON part_info USING BRIN(id) 
WITH (pages_per_range = 128);

-- Analyze the specific range to understand data distribution
ANALYZE part_info;

-- Check data distribution around 2.8M
WITH range_analysis AS (
  SELECT 
    (id / 100000) * 100000 as range_start,
    COUNT(*) as part_count,
    COUNT(DISTINCT fsg) as unique_fsgs
  FROM part_info
  WHERE id >= 2500000 AND id <= 3500000
    AND nsn IS NOT NULL
  GROUP BY (id / 100000)
  ORDER BY range_start
)
SELECT 
  range_start,
  range_start + 99999 as range_end,
  part_count,
  unique_fsgs,
  CASE 
    WHEN part_count = 0 THEN 'EMPTY'
    WHEN part_count < 100 THEN 'SPARSE'
    ELSE 'NORMAL'
  END as density
FROM range_analysis;

-- Create a materialized view for quick lookups of valid ranges
-- This pre-computes which ranges have data
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_valid_id_ranges AS
WITH ranges AS (
  SELECT 
    (id / 3000) * 3000 + 1 as start_id,
    (id / 3000) * 3000 + 3000 as end_id,
    COUNT(*) as part_count
  FROM part_info
  WHERE nsn IS NOT NULL AND nsn != ''
  GROUP BY (id / 3000)
)
SELECT start_id, end_id, part_count
FROM ranges
WHERE part_count > 0
ORDER BY start_id;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_mv_valid_ranges_start 
ON mv_valid_id_ranges(start_id);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW mv_valid_id_ranges;

-- Grant permissions if needed
GRANT SELECT ON mv_valid_id_ranges TO PUBLIC;

-- Show statistics for the problematic range
SELECT 
  'Range 2.8M-3M' as range_desc,
  COUNT(*) as total_parts,
  COUNT(DISTINCT fsg) as unique_fsgs,
  COUNT(DISTINCT fsc) as unique_fscs,
  MIN(id) as min_id,
  MAX(id) as max_id
FROM part_info
WHERE id >= 2800000 AND id <= 3000000
  AND nsn IS NOT NULL;

-- Identify completely empty 3000-part chunks in the 2.8M+ range
WITH empty_chunks AS (
  SELECT 
    generate_series(2800000, 5000000, 3000) as chunk_start
)
SELECT 
  chunk_start,
  chunk_start + 2999 as chunk_end,
  'EMPTY' as status
FROM empty_chunks ec
WHERE NOT EXISTS (
  SELECT 1 
  FROM part_info pi
  WHERE pi.id >= ec.chunk_start 
    AND pi.id < ec.chunk_start + 3000
    AND pi.nsn IS NOT NULL
  LIMIT 1
)
ORDER BY chunk_start
LIMIT 20;