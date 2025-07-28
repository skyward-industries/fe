#!/bin/bash

echo "🔍 Analyzing sitemap ranges..."

# Use the database connection from your logs
DB_URL="postgres://postgres:Skyward_db_pw1234!@skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com:5432/skyward?sslmode=require"

echo "📊 Getting basic stats..."
psql "$DB_URL" -c "
SELECT 
  'Database Stats' as metric,
  COUNT(*) as total_parts,
  COUNT(CASE WHEN nsn IS NOT NULL AND nsn != '' THEN 1 END) as parts_with_nsn,
  MIN(id) as min_id,
  MAX(id) as max_id
FROM part_info;
"

echo "🔍 Finding valid ranges (first 20)..."
psql "$DB_URL" -c "
WITH range_analysis AS (
  SELECT 
    FLOOR(pi.id/3000)*3000 + 1 as start_id,
    FLOOR(pi.id/3000)*3000 + 3000 as end_id,
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
  start_id,
  end_id,
  valid_nsn_count,
  ROUND(valid_nsn_count * 100.0 / 3000, 2) as density_percent
FROM range_analysis
ORDER BY start_id
LIMIT 20;
"

echo "✅ Analysis complete!"
