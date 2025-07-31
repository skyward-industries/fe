#!/bin/bash

# Wait for orphaned connections to timeout
echo "⏳ Waiting for orphaned connections to timeout..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Function to check connections
check_connections() {
    psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
    SELECT count(*) as active_connections
    FROM pg_stat_activity 
    WHERE state = 'active' 
        AND pid <> pg_backend_pid();
    " | tail -n 1
}

# Initial check
echo "📊 Initial connections: $(check_connections)"

# Wait and check every 30 seconds
for i in {1..20}; do
    echo "⏳ Waiting... (${i}/20) - $(date)"
    sleep 30
    
    connections=$(check_connections)
    echo "📊 Current connections: $connections"
    
    # If connections drop to 0 or low, we can restart
    if [ "$connections" -lt 5 ]; then
        echo "✅ Connections dropped to $connections - safe to restart!"
        break
    fi
done

echo ""
echo "📊 Final connection count: $(check_connections)"

# Clear password
unset PGPASSWORD

echo "💡 If connections are low (< 5), you can restart the app:"
echo "   pm2 start ecosystem.config.cjs"