# Sitemap Crawling Issue - Analysis & Fix

## Problem Identified

Google is crawling **old URL format** from its cache, while your sitemaps contain the **new URL format**.

### URL Format Comparison

**OLD FORMAT** (What Google is currently crawling):
```
/catalog/30/mechanical-power-transmission-equipment/3040/nsn-miscellaneous-power-transmission-equipment/nsn-3040-01-648-4736
```

**NEW FORMAT** (What's in your current sitemaps):
```
/catalog/30/mechanical-power-transmission-equipment/3040/miscellaneous-power-transmission-equipment/3040-01-648-4736
```

**Key Differences:**
1. Old format has `nsn-` prefix before subgroup name
2. Old format has `nsn-` prefix before the NSN itself
3. New format has no `nsn-` prefixes

## Root Cause

1. **Historical**: Previously generated sitemaps used the `nsn-` prefix format
2. **Google's Cache**: Google indexed those old URLs and hasn't re-crawled new sitemaps yet
3. **Duplicate Content**: Both URL formats work (the code strips `nsn-` prefix if present)
4. **Sitemap Ignored**: Google continues crawling cached URLs instead of discovering new ones

## Solutions Implemented

### 1. ✅ Added 301 Redirects in Middleware

**File**: `middleware.ts`

- Detects old URL format with `nsn-` prefixes
- 301 redirects to new format (without prefixes)
- Handles both full old format and partial old format
- This tells Google: "The old URL has permanently moved to this new URL"

### 2. ✅ Fixed Canonical URLs

**File**: `src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]/page.tsx`

- Canonical URLs now **always** use new format (without `nsn-` prefixes)
- Even if someone accesses old URL, canonical points to new URL
- Prevents duplicate content issues in search engines

### 3. ✅ Verified Sitemap Configuration

**File**: `public/robots.txt`

```
Sitemap: https://skywardparts.com/sitemap_index.xml
```

**Status**: ✅ Correct - points to the right sitemap index

## How This Fixes the Problem

### Immediate Effect:
1. When Googlebot crawls old URLs, it gets **301 redirect** to new format
2. Google updates its index to use new URLs
3. Canonical tags reinforce the correct URL format

### Long-term Effect:
1. Google will eventually re-crawl sitemaps
2. Old URLs will be replaced with new ones in search index
3. All traffic funnels to consistent URL format

## Next Steps (Action Required)

### 1. Deploy the Changes

```bash
# Build the application
npm run build

# Deploy to production
npm run start:prod
```

### 2. Test the Redirects

Test that old URLs redirect to new format:

```bash
# Should redirect to new format
curl -I https://skywardparts.com/catalog/30/mechanical-power-transmission-equipment/3040/nsn-miscellaneous-power-transmission-equipment/nsn-3040-01-648-4736

# Expected response: 301 Moved Permanently
# Location: https://skywardparts.com/catalog/30/mechanical-power-transmission-equipment/3040/miscellaneous-power-transmission-equipment/3040-01-648-4736
```

### 3. Request Re-crawl in Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Navigate to **Sitemaps** section
3. **Remove** any old sitemap submissions (if they reference old URLs)
4. **Submit** current sitemap: `https://skywardparts.com/sitemap_index.xml`
5. Click "Request Indexing" for a few sample catalog pages with new format

### 4. Monitor Google's Response (1-2 weeks)

**Check in Google Search Console:**
- **Coverage Report**: Watch for increase in valid indexed pages
- **Sitemaps Report**: Verify new URLs are being discovered
- **URL Inspection**: Test both old and new URLs to see their status

**What to expect:**
- Old URLs: Will show "Redirect" status
- New URLs: Will show "Indexed" or "Discovered"
- Crawl rate should increase as Google trusts your new structure

### 5. Force Google to Re-crawl Key Pages (Optional)

For immediate visibility of important pages:
1. In Search Console, use "URL Inspection" tool
2. Enter new format URL
3. Click "Request Indexing"
4. Repeat for 10-20 high-priority pages

## Timeline

- **Immediate** (after deployment): Redirects active, canonical URLs fixed
- **1-3 days**: Googlebot encounters redirects, starts updating index
- **1-2 weeks**: Majority of old URLs replaced with new ones
- **2-4 weeks**: Full index update, old URLs completely phased out

## Verification Commands

### Check that redirects are working:
```bash
# Test old format URL
curl -I https://skywardparts.com/catalog/30/mechanical-power-transmission-equipment/3040/nsn-miscellaneous-power-transmission-equipment/nsn-3040-00-478-9508

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://skywardparts.com/catalog/30/mechanical-power-transmission-equipment/3040/miscellaneous-power-transmission-equipment/3040-00-478-9508
```

### Verify sitemap is accessible:
```bash
curl -I https://skywardparts.com/sitemap_index.xml
# Should return: HTTP/1.1 200 OK

# Check sitemap content includes new format URLs
curl https://skywardparts.com/sitemap-1-1000.xml | grep -o "catalog/[^<]*" | head -5
```

### Check canonical URLs in production:
```bash
# Visit a new format URL and check source for:
curl -s https://skywardparts.com/catalog/30/mechanical-power-transmission-equipment/3040/miscellaneous-power-transmission-equipment/3040-00-478-9508 | grep "canonical"

# Should see canonical without nsn- prefix
```

## Additional Notes

### Why Google Wasn't Crawling New Sitemaps:
1. Google crawls based on **historical patterns**
2. If old sitemaps took long to crawl, Google may have **deprioritized** them
3. With redirects in place, Google will **discover new URLs organically** through old URL crawls
4. This is actually **faster** than waiting for sitemap re-crawl

### Current Sitemap Status:
- **Format**: ✅ Correct (no `nsn-` prefixes)
- **Submission**: Last modified October 6, 2025
- **Coverage**: Contains ~1 million parts

## Files Modified

1. `middleware.ts` - Added 301 redirects from old to new URL format
2. `src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]/page.tsx` - Fixed canonical URL generation

## Success Metrics

Monitor these in Google Search Console:

- **Indexed pages**: Should increase as new URLs get indexed
- **Crawl requests**: Should decrease errors, increase success rate
- **Click-through rate**: May improve with cleaner URLs
- **Old URL 4xx errors**: Should decrease as redirects take effect
