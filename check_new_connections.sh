#!/bin/bash

# Check what's causing new active connections
echo "🔍 Checking new active connections..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

echo "📊 Current active connections:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

echo ""
echo "🔍 What are the active connections doing:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid()
ORDER BY query_start;
"

echo ""
echo "📊 Connections by application:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    COALESCE(application_name, 'unknown') as application_name,
    count(*) as connection_count,
    string_agg(DISTINCT client_addr::text, ', ') as client_addresses
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid()
GROUP BY application_name
ORDER BY connection_count DESC;
"

# Clear password
unset PGPASSWORD

echo ""
echo "💡 If these are sitemap queries again, we need to disable sitemap generation temporarily."