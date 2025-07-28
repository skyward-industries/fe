-- Check the columns available in pg_stat_user_indexes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'pg_catalog' 
AND table_name = 'pg_stat_user_indexes'
ORDER BY ordinal_position;