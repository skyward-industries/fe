#!/bin/bash

# Check orphaned database connections
echo "🔍 Checking orphaned database connections..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

echo "📊 Connection summary:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    count(*) as total_connections,
    count(CASE WHEN state = 'active' THEN 1 END) as active_connections,
    count(CASE WHEN state = 'idle' THEN 1 END) as idle_connections,
    count(CASE WHEN state = 'idle in transaction' THEN 1 END) as idle_in_transaction
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid();
"

echo ""
echo "🔍 Detailed orphaned connections:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid()
ORDER BY query_start;
"

echo ""
echo "📊 Connections by state:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    state,
    count(*) as count,
    min(query_start) as oldest_query,
    max(query_start) as newest_query
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid()
GROUP BY state
ORDER BY count DESC;
"

# Clear password
unset PGPASSWORD