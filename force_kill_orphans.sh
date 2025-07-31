#!/bin/bash

# Force kill orphaned connections
echo "🔪 Force killing orphaned connections..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Check connections before
echo "📊 Connections before force kill:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

echo ""
echo "🔍 Checking user privileges:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    current_user as current_user,
    session_user as session_user,
    'Superuser: ' || (SELECT rolname FROM pg_roles WHERE oid = current_user) as superuser_status;
"

echo ""
echo "🚨 Attempting to cancel queries (less aggressive):"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    'Canceling: ' || pid || ' (' || usename || '@' || COALESCE(client_addr::text, 'unknown') || ')' as action,
    pg_cancel_backend(pid) as canceled
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

echo ""
echo "⏳ Waiting 5 seconds..."
sleep 5

echo ""
echo "🚨 Attempting to terminate connections (more aggressive):"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    'Terminating: ' || pid || ' (' || usename || '@' || COALESCE(client_addr::text, 'unknown') || ')' as action,
    pg_terminate_backend(pid) as terminated
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

echo ""
echo "⏳ Waiting 5 seconds..."
sleep 5

echo ""
echo "📊 Connections after force kill attempts:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

echo ""
echo "🔍 Remaining connections:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 50) as query_preview
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid()
ORDER BY query_start;
"

# Clear password
unset PGPASSWORD

echo ""
echo "✅ Force kill attempts complete!"