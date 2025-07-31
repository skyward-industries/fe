#!/bin/bash

# IMMEDIATE EMERGENCY SHUTDOWN
echo "🚨 IMMEDIATE EMERGENCY SHUTDOWN - Killing everything..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Check connections before
echo "📊 Connections before shutdown:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Force kill all PM2 processes
echo "⏹️ Force stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# Force kill any Node.js processes
echo "🔪 Force killing Node.js processes..."
sudo pkill -9 -f "node"
sudo pkill -9 -f "next"
sudo pkill -9 -f "skyward"

# Kill any remaining processes
echo "🔪 Killing any remaining processes..."
sudo pkill -9 -f "pm2"

# Wait for everything to die
echo "⏳ Waiting for processes to die..."
sleep 20

# Check if any processes are still running
echo "🔍 Checking for remaining processes..."
ps aux | grep -E "(node|next|skyward|pm2)" | grep -v grep

# Check connections after shutdown
echo "📊 Connections after shutdown:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Clear password
unset PGPASSWORD

echo "✅ Emergency shutdown complete!"
echo "⚠️ Application is now STOPPED"
echo "💡 To restart later: pm2 start ecosystem.config.cjs"