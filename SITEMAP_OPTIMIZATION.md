# Sitemap Generation Optimization

## Overview
This document describes the optimizations made to fix sitemap generation issues with high ID ranges that were causing 404s and timeouts.

## Update: Enhanced High ID Range Optimizations
Additional optimizations have been added to handle very high and sparse ID ranges more efficiently.

## Latest Update: 2.8M+ Range Timeout Fix
Specific optimizations added to handle the timeout issues occurring around 2.8 million IDs.

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

### 4. Enhanced High ID Range Handling
- **Pre-check for existence**: Quick EXISTS query for high ID ranges before full query
- **Different query strategies**: Optimized queries for very high IDs (>10M)
- **Graceful timeout handling**: Return empty results instead of errors on timeout
- **BRIN indexes**: Added for efficient scanning of large ID ranges

### 5. ID Range Analysis Tool (`analyze-valid-id-ranges.js`)
Identifies which ID ranges actually contain data:
```bash
node analyze-valid-id-ranges.js
```
This generates:
- `valid-id-ranges.json`: Complete analysis of ID distribution
- `sitemap-index-entries.txt`: Pre-generated sitemap index entries

## Additional Database Indexes

Run `optimize_high_id_indexes.sql` for high ID range optimization:
- Partial indexes for high ID ranges
- BRIN index for efficient large range scans
- Optimized table statistics

## Troubleshooting

### If sitemaps are still slow:
1. Run the ID range analysis: `node analyze-valid-id-ranges.js`
2. Check if all indexes are created: `SELECT * FROM pg_indexes WHERE tablename = 'part_info';`
3. Update table statistics: `VACUUM ANALYZE part_info;`
4. Check query performance: Use EXPLAIN ANALYZE on the sitemap query
5. Consider using the generated `valid-id-ranges.json` to skip empty ranges

### 6. 2.8M+ Range Specific Optimizations
- **VERY_HIGH_ID_THRESHOLD (2.8M)**: Special handling for problematic range
- **Quick existence check**: 2-second timeout check before full query
- **Known empty ranges**: Pre-configured empty ranges skip queries entirely
- **Ultra-fast queries**: Minimal joins and EXISTS subqueries for 2.8M+
- **Aggressive caching**: 1-week cache for empty results

## Tools for Managing Empty Ranges

### Identify Empty Ranges
```bash
# Analyze your database to find empty ranges
node identify-empty-ranges.js
```
This generates:
- `empty-ranges-config.json`: Complete empty range analysis
- `src/app/api/sitemap-parts/empty-ranges.ts`: TypeScript configuration

### Database Optimizations for 2.8M Range
```bash
# Run specific optimizations for the problematic range
psql -d your_database -f optimize_2_8m_range.sql
```

### If getting timeouts:
1. The system now returns empty sitemaps on timeout (not errors)
2. Run `optimize_2_8m_range.sql` for 2.8M+ range optimization
3. Run `identify-empty-ranges.js` to map truly empty ranges
4. Update the KNOWN_EMPTY_RANGES array in the API with your findings
5. Consider using the materialized view `mv_valid_id_ranges` for lookups