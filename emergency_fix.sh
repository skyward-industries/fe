#!/bin/bash

echo "🚨 EMERGENCY: Stopping application to prevent database overload"
echo ""
echo "1. First, stop the applications to prevent new queries:"
echo "   pm2 stop all"
echo ""
echo "2. Then kill all stuck queries:"
echo "   psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward"
echo ""
echo "   Paste this SQL:"

cat << 'EOF'
-- Kill all active queries except our own
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND pid <> pg_backend_pid();

-- Verify they're gone
SELECT count(*) as active_queries 
FROM pg_stat_activity 
WHERE state = 'active' 
AND pid <> pg_backend_pid();
EOF

echo ""
echo "3. Fix the problematic query by adding a timeout to the part detail endpoint"
echo ""
echo "4. ONLY THEN restart the application:"
echo "   pm2 start all"
echo ""
echo "The issue: Part detail queries with 6+ JOINs are taking over an hour!"
echo "These queries need indexes or query optimization ASAP!"