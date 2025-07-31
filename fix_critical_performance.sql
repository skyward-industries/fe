-- CRITICAL PERFORMANCE FIX
-- Create missing index on nsn_with_inc.nsn column
-- This table has 9M+ rows and is causing 25+ second query times

-- 1. Create index on nsn_with_inc.nsn (this is the main bottleneck)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nsn_with_inc_nsn 
ON nsn_with_inc (nsn);

-- 2. Analyze the table to update statistics after index creation
ANALYZE nsn_with_inc;

-- 3. Check the table size and row count
SELECT 
  pg_size_pretty(pg_total_relation_size('nsn_with_inc')) AS table_size,
  (SELECT count(*) FROM nsn_with_inc) AS row_count,
  'Critical index created for partInfo performance' AS note;