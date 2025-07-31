-- Monitor current database performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  min_time,
  max_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%part_info%' 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check for long-running queries
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state = 'active';

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes
WHERE tablename IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'freight_info', 'char_data', 'wp_fsgs_new')
ORDER BY idx_scan DESC;

-- Check table scan stats
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup
FROM pg_stat_user_tables
WHERE tablename IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'freight_info', 'char_data', 'wp_fsgs_new')
ORDER BY seq_scan DESC;