#!/bin/bash

# Script to check current database connections
echo "🔍 Checking current database connections..."

# Connect to database and check active connections
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
    application_name,
    count(*) as connection_count,
    string_agg(DISTINCT client_addr::text, ', ') as client_addresses
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid()
GROUP BY application_name
ORDER BY connection_count DESC;
"