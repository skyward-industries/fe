#!/bin/bash

# Emergency restart script to clear database connections
echo "🚨 Emergency restart to clear database connections..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Check connections before restart
echo "📊 Connections before restart:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Stop the application
echo "⏹️ Stopping skyward-prod..."
pm2 stop skyward-prod

# Wait a moment for connections to close
echo "⏳ Waiting for connections to close..."
sleep 10

# Check connections after stop
echo "📊 Connections after stop:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Start the application
echo "▶️ Starting skyward-prod..."
pm2 start skyward-prod

# Wait for app to start
echo "⏳ Waiting for app to start..."
sleep 5

# Check connections after restart
echo "📊 Connections after restart:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Check status
echo "📊 Application status:"
pm2 status

echo "✅ Restart complete! Database connections should be cleared."

# Clear password from environment
unset PGPASSWORD