-- Check what's blocking the index creation
SELECT 
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query,
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query,
    blocking.state AS blocking_state
FROM pg_stat_activity blocked
JOIN pg_locks blocked_locks ON blocked.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocked_locks.locktype = blocking_locks.locktype
    AND blocked_locks.database = blocking_locks.database
    AND blocked_locks.relation = blocking_locks.relation
    AND blocked_locks.pid != blocking_locks.pid
JOIN pg_stat_activity blocking ON blocking.pid = blocking_locks.pid
WHERE blocked.pid = 28830; -- The index creation process

-- Check table size to understand the scope
SELECT 
    pg_size_pretty(pg_total_relation_size('char_data')) AS table_size,
    (SELECT count(*) FROM char_data) AS exact_row_count;