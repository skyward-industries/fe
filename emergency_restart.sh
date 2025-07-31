#!/bin/bash

# EMERGENCY RESTART - Force kill all processes and restart
echo "🚨 EMERGENCY RESTART - Force killing all processes..."

# Set password environment variable
export PGPASSWORD='Skyward_db_pw1234!'

# Check connections before
echo "📊 Connections before emergency restart:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Force stop all PM2 processes
echo "⏹️ Force stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# Kill any remaining Node.js processes
echo "🔪 Killing any remaining Node.js processes..."
pkill -f "node"
pkill -f "next"
pkill -f "skyward"

# Wait for processes to die
echo "⏳ Waiting for processes to die..."
sleep 15

# Check if any processes are still running
echo "🔍 Checking for remaining processes..."
ps aux | grep -E "(node|next|skyward)" | grep -v grep

# Start fresh
echo "▶️ Starting fresh application..."
cd /home/ec2-user/fe
pm2 start ecosystem.config.cjs

# Wait for app to start
echo "⏳ Waiting for app to start..."
sleep 10

# Check connections after restart
echo "📊 Connections after emergency restart:"
psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
SELECT count(*) as active_connections
FROM pg_stat_activity 
WHERE state = 'active' 
    AND pid <> pg_backend_pid();
"

# Check PM2 status
echo "📊 PM2 status:"
pm2 status

# Clear password
unset PGPASSWORD

echo "✅ Emergency restart complete!"