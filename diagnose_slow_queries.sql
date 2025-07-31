-- Test a specific slow NSN to see what's happening
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  pi.nsn,
  pi.fsg,
  pi.fsc,
  fsgs.fsg_title,
  fsgs.fsc_title,
  pn.part_number,
  pn.cage_code,
  addr.company_name,
  addr.street_address_1,
  addr.street_address_2,
  addr.po_box,
  addr.city,
  addr.state,
  addr.zip,
  addr.country,
  addr.date_est,
  vfm.moe_rule AS moe_rule_vfm,
  vfm.aac,
  vfm.sos,
  vfm.sosm,
  vfm.unit_of_issue,
  vfm.controlled_inventory_code,
  vfm.shelf_life_code,
  vfm.replenishment_code,
  vfm.management_control_code,
  vfm.use_status_code,
  vfm.effective_date AS row_effective_date,
  vfm.row_observation_date AS row_obs_date_fm,
  fi.activity_code,
  fi.nmfc_number,
  fi.nmfc_subcode,
  fi.uniform_freight_class,
  fi.ltl_class,
  fi.wcc,
  fi.shc,
  fi.adc,
  fi.acc,
  fi.nmf_desc,
  pi.niin
FROM part_info pi
LEFT JOIN part_numbers pn ON pi.nsn = pn.nsn
LEFT JOIN wp_cage_addresses addr ON pn.cage_code = addr.cage_code
LEFT JOIN v_flis_management vfm ON vfm.niin = pi.niin
LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
LEFT JOIN freight_info fi ON pi.niin = fi.niin
WHERE REPLACE(pi.nsn, '-', '') = '1430012531352';

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_tup_ins AS rows_inserted,
  n_tup_upd AS rows_updated,
  n_tup_del AS rows_deleted,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE tablename IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'v_flis_management', 'wp_fsgs_new', 'freight_info', 'char_data')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for missing indexes on join columns
SELECT 
    'CREATE INDEX CONCURRENTLY idx_' || tablename || '_' || attname || ' ON ' || schemaname || '.' || tablename || ' (' || attname || ');' AS create_index_statement
FROM (
    SELECT 
        n.nspname AS schemaname,
        c.relname AS tablename,
        a.attname AS attname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE c.relkind = 'r'
    AND n.nspname = 'public'
    AND c.relname IN ('part_info', 'part_numbers', 'wp_cage_addresses', 'freight_info', 'char_data')
    AND a.attname IN ('nsn', 'niin', 'cage_code', 'fsg', 'fsc')
    AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_class ic ON ic.oid = i.indexrelid
        WHERE i.indrelid = c.oid
        AND a.attnum = ANY(i.indkey)
    )
) AS missing_indexes;