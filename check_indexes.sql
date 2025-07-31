-- Check indexes on tables used in the part detail query
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'v_flis_management', 'wp_fsgs_new', 'freight_info', 'char_data')
ORDER BY tablename, indexname;

-- Check if we have indexes on the key columns used in JOINs and WHERE clauses
SELECT 
    t.relname AS table_name,
    a.attname AS column_name,
    i.relname AS index_name
FROM pg_class t
JOIN pg_attribute a ON a.attrelid = t.oid
LEFT JOIN pg_index ix ON ix.indrelid = t.oid AND a.attnum = ANY(ix.indkey)
LEFT JOIN pg_class i ON i.oid = ix.indexrelid
WHERE t.relkind = 'r'
AND t.relname IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'freight_info', 'char_data')
AND a.attname IN ('nsn', 'niin', 'cage_code', 'fsg', 'fsc')
ORDER BY t.relname, a.attname;