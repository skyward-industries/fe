#!/bin/bash

# Script to check current database connections without password prompt
echo "🔍 Checking current database connections..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Connect to database and check active connections
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
echo "📊 Active connections by application:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    COALESCE(application_name, 'unknown') as application_name,
    count(*) as connection_count,
    string_agg(DISTINCT client_addr::text, ', ') as client_addresses,
    max(query_start) as latest_query
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid()
GROUP BY application_name
ORDER BY connection_count DESC;
"

echo ""
echo "🔍 Detailed active connections:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 80) as query_preview
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid()
ORDER BY query_start;
"

# Clear password from environment
unset PGPASSWORD