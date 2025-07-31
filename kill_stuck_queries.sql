-- Force kill all long-running queries
-- First, try to cancel them
SELECT pg_cancel_backend(pid), pid, state, query_start, now() - query_start as duration
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '1 minute'
AND pid <> pg_backend_pid();

-- Wait a moment, then force terminate any that remain
SELECT pg_terminate_backend(pid), pid, state, query_start, now() - query_start as duration
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '1 minute'
AND pid <> pg_backend_pid();

-- If they still won't die, use this nuclear option (kills by PID)
-- Run for each PID that won't die:
-- SELECT pg_terminate_backend(23339);
-- SELECT pg_terminate_backend(23342);
-- SELECT pg_terminate_backend(23343);
-- SELECT pg_terminate_backend(23344);
-- SELECT pg_terminate_backend(23358);
-- SELECT pg_terminate_backend(23359);
-- SELECT pg_terminate_backend(23361);
-- SELECT pg_terminate_backend(23362);
-- SELECT pg_terminate_backend(23363);
-- SELECT pg_terminate_backend(23367);