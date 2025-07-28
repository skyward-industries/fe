#!/bin/bash
echo "🔍 Finding ALL valid ranges..."
DB_URL="postgres://postgres:Skyward_db_pw1234!@skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com:5432/skyward?sslmode=require"

psql "$DB_URL" -c "
SELECT COUNT(*) as total_valid_ranges
FROM (
  SELECT FLOOR(pi.id/3000)*3000 + 1 as start_id
  FROM part_info pi
  LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
  WHERE pi.nsn IS NOT NULL 
  AND pi.nsn != ''
  AND fsgs.fsg_title IS NOT NULL 
  AND fsgs.fsc_title IS NOT NULL
  GROUP BY FLOOR(pi.id/3000)
  HAVING COUNT(DISTINCT pi.nsn) > 0
) valid_ranges;
"

echo "🎯 Getting range distribution..."
psql "$DB_URL" -c "
WITH range_stats AS (
  SELECT 
    FLOOR(pi.id/3000)*3000 + 1 as start_id,
    COUNT(DISTINCT pi.nsn) as valid_nsn_count
  FROM part_info pi
  LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
  WHERE pi.nsn IS NOT NULL 
  AND pi.nsn != ''
  AND fsgs.fsg_title IS NOT NULL 
  AND fsgs.fsc_title IS NOT NULL
  GROUP BY FLOOR(pi.id/3000)
  HAVING COUNT(DISTINCT pi.nsn) > 0
)
SELECT 
  MIN(start_id) as first_valid_range,
  MAX(start_id) as last_valid_range,
  COUNT(*) as total_ranges,
  SUM(valid_nsn_count) as total_nsns,
  ROUND(AVG(valid_nsn_count), 0) as avg_nsns_per_range
FROM range_stats;
"
