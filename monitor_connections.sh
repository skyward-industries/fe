#!/bin/bash
export PGPASSWORD='Skyward_db_pw1234!'
while true; do
    clear
    echo "🕐 $(date)"
    echo "�� Active connections:"
    psql -h skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com -U postgres -d skyward -c "
    SELECT count(*) as active_connections
    FROM pg_stat_activity 
    WHERE state = 'active' 
        AND pid <> pg_backend_pid();
    " | tail -n 1
    echo ""
    echo "⏳ Waiting for connections to timeout... (Ctrl+C to stop)"
    sleep 30
done
