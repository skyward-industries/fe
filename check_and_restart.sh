#!/bin/bash

# Check connections and restart if safe
echo "🔍 Checking current connection status..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Check current connections
echo "📊 Current connection status:"
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
echo "🔍 Detailed connection breakdown:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT 
    state,
    count(*) as count,
    min(query_start) as oldest,
    max(query_start) as newest
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid()
GROUP BY state
ORDER BY count DESC;
"

# Get active connection count - fixed to handle empty/zero results
active_count=$(psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -t -c "
SELECT COALESCE(count(*), 0)
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
" | tr -d ' ')

echo ""
echo "📊 Active connections: ${active_count:-0}"

# Clear password
unset PGPASSWORD

# Check if it's safe to restart
if [ "${active_count:-0}" -lt 5 ]; then
    echo "✅ Safe to restart! Active connections: ${active_count:-0}"
    echo ""
    echo "🚀 Restarting application..."
    pm2 restart ecosystem.config.cjs
    
    echo ""
    echo "📊 PM2 status:"
    pm2 status
    
    echo ""
    echo "✅ Application restarted successfully!"
else
    echo "⚠️ Still ${active_count} active connections - wait a bit longer"
    echo "💡 Run this script again in a few minutes"
fi