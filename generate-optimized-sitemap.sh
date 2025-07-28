#!/bin/bash
echo "🔧 Generating optimized sitemap index..."

DB_URL="postgres://postgres:Skyward_db_pw1234!@skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com:5432/skyward?sslmode=require"

# Generate XML sitemap index with sequential ID ranges
psql "$DB_URL" -t -A -c "
WITH valid_ranges AS (
  SELECT 
    FLOOR((pi.id-1)/3000)*3000 + 1 as start_id,
    FLOOR((pi.id-1)/3000)*3000 + 3000 as end_id
  FROM part_info pi
  LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
  WHERE pi.nsn IS NOT NULL 
  AND pi.nsn != ''
  AND fsgs.fsg_title IS NOT NULL 
  AND fsgs.fsc_title IS NOT NULL
  GROUP BY FLOOR((pi.id-1)/3000)
  HAVING COUNT(DISTINCT pi.nsn) > 0
  ORDER BY start_id
)
SELECT 
'<?xml version=\"1.0\" encoding=\"UTF-8\"?><sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">'
UNION ALL
SELECT 
'  <sitemap>    <loc>https://skywardparts.com/sitemap/' || start_id || '/' || end_id || '.xml</loc>    <lastmod>' || to_char(now(), 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') || '</lastmod>  </sitemap>'
FROM valid_ranges
UNION ALL
SELECT '</sitemapindex>';
" > public/sitemap_index_optimized.xml

sed -i '1s/^[[:space:]]*//' public/sitemap_index_optimized.xml