#!/bin/bash

echo "Monitoring Googlebot activity..."
echo "Press Ctrl+C to stop"
echo ""

# Count requests per minute
while true; do
    echo "=== $(date '+%Y-%m-%d %H:%M:%S') ==="
    
    # Get last minute of logs
    CURRENT_TIME=$(date '+%d/%b/%Y:%H:%M')
    COUNT=$(sudo grep -i googlebot /var/log/nginx/access.log | grep "$CURRENT_TIME" | wc -l)
    
    echo "Googlebot requests in last minute: $COUNT"
    
    # Show last 5 Googlebot requests
    echo "Recent requests:"
    sudo grep -i googlebot /var/log/nginx/access.log | tail -5 | awk '{print $1, $4, $5, $7, $9}'
    
    echo ""
    sleep 60
done