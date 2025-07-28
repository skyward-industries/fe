# Sitemap Generation Optimization

## Overview
This document describes the optimizations made to fix sitemap generation issues with high ID ranges that were causing 404s and timeouts.

## Changes Made

### 1. Database Query Optimization (`src/app/api/sitemap-parts/route.ts`)
- **Removed double query**: Combined COUNT and data retrieval into a single query using CTE
- **Improved JOIN**: Changed from LEFT JOIN to INNER JOIN for better performance
- **Added statement timeout**: Set query timeout to prevent long-running queries
- **Better connection handling**: Properly manage database connections with try/finally

### 2. Empty Sitemap Handling (`src/app/sitemap/[startRange]/[endRange].xml/route.ts`)
- **Return empty sitemaps instead of 404s**: This prevents search engines from repeatedly trying to fetch "missing" sitemaps
- **Extended caching for empty results**: Cache empty sitemaps for 24 hours
- **Added stale-while-revalidate**: Improves cache performance

### 3. Database Indexes (run `optimize_sitemap_indexes.sql`)
Required indexes for optimal performance:
```sql
-- Composite index for ID range queries
CREATE INDEX idx_part_info_sitemap 
ON part_info(id, fsg, fsc, nsn) 
WHERE nsn IS NOT NULL AND nsn != '';

-- Index for join performance
CREATE INDEX idx_wp_fsgs_new_fsg 
ON wp_fsgs_new(fsg) 
WHERE fsg_title IS NOT NULL AND fsc_title IS NOT NULL;
```

## Testing

### Local Testing
```bash
# Test specific ranges
node test-sitemap-ranges.js

# Or test individual sitemaps
curl -I http://localhost:3000/sitemap/1/3000.xml
curl -I http://localhost:3000/sitemap/10000001/10003000.xml
```

### Production Monitoring
Check the logs for:
- Query execution times
- Empty sitemap returns
- Timeout errors

## Performance Expectations
- Most queries should complete in < 2 seconds
- High ID ranges with no data return empty sitemaps (200 OK) instantly
- Caching reduces load for frequently accessed ranges

## Troubleshooting

### If sitemaps are still slow:
1. Check if indexes are created: `SELECT * FROM pg_indexes WHERE tablename = 'part_info';`
2. Update table statistics: `ANALYZE part_info; ANALYZE wp_fsgs_new;`
3. Check query performance: Use EXPLAIN ANALYZE on the sitemap query
4. Consider partitioning the part_info table by ID ranges

### If getting timeouts:
1. Reduce batch size in sitemap-parts API
2. Add more specific indexes for problematic ID ranges
3. Consider pre-generating sitemaps for known ranges