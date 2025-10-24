# Quick Setup Guide: Sitemap Automation

## Immediate Action Required

Your sitemaps are **72 days old** (last updated August 13, 2025). This caused Google's crawl rate to drop from 67k/day to 2/day. Follow these steps to fix it immediately.

## Step 1: Regenerate Sitemaps NOW

```bash
# Run safe regeneration (recommended)
npm run generate-sitemaps:safe

# This will:
# - Create backup of existing sitemaps
# - Generate fresh sitemaps with today's date
# - Validate the new sitemaps
# - Provide rollback if anything fails
```

**Expected Time:** 10-20 minutes depending on database speed

## Step 2: Commit and Push Changes

```bash
# Add the regenerated sitemaps
git add public/sitemap*.xml

# Commit with descriptive message
git commit -m "fix: regenerate sitemaps to restore Google crawl rate

- Updated lastmod timestamps from Aug 13 to Oct 24, 2025
- Fixes 72-day staleness causing 67k/day → 2/day drop
- Part of automated sitemap management implementation"

# Push to main
git push origin main
```

## Step 3: Notify Search Engines

```bash
# Notify search engines immediately
npm run notify-search-engines

# This will:
# - Submit to Bing, Yandex via IndexNow
# - Ping Google with sitemap location
# - Speed up discovery of fresh content
```

**Note:** You'll see a warning about missing INDEXNOW_API_KEY. This is optional but recommended for faster indexing. See step 6 for setup.

## Step 4: Deploy to Production

```bash
# SSH into your EC2 instance
ssh ec2-user@<your-ec2-ip>

# Navigate to project
cd /path/to/fe

# Pull latest changes
git pull origin main

# Restart the application if needed
pm2 restart all
```

## Step 5: Set Up GitHub Actions (Automated Daily Regeneration)

### 5.1 Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and Variables → Actions

Add these secrets:

| Secret Name | Value | Required |
|------------|-------|----------|
| `PGHOST` | `skywardnew.cjwsewswq7sh.us-east-2.rds.amazonaws.com` | ✅ Yes |
| `PGPORT` | `5432` | ✅ Yes |
| `PGDATABASE` | `skyward` | ✅ Yes |
| `PGUSER` | `postgres` | ✅ Yes |
| `PGPASSWORD` | `Skyward_db_pw1234!` | ✅ Yes |
| `INDEXNOW_API_KEY` | Get from bing.com/indexnow | ⚠️  Recommended |
| `CLOUDFLARE_ZONE_ID` | From Cloudflare dashboard | ⚙️ Optional |
| `CLOUDFLARE_API_TOKEN` | From Cloudflare API tokens | ⚙️ Optional |

### 5.2 Verify Workflow File Exists

```bash
# Check if workflow file exists
ls -la .github/workflows/regenerate-sitemaps.yml

# If it exists, you'll see:
# -rw-r--r-- 1 user user 3456 Oct 24 12:00 regenerate-sitemaps.yml
```

### 5.3 Enable GitHub Actions

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. If Actions are disabled, click "Enable Actions"
4. Find "Regenerate Sitemaps Daily" workflow
5. Click "Enable workflow" if needed

### 5.4 Test Manual Trigger

1. Go to Actions tab
2. Select "Regenerate Sitemaps Daily"
3. Click "Run workflow" dropdown
4. Click green "Run workflow" button
5. Wait 2-3 minutes
6. Check workflow run for success ✅

## Step 6: Set Up IndexNow (Optional but Recommended)

### 6.1 Get API Key

1. Visit https://www.bing.com/indexnow
2. Click "Get API Key"
3. Copy the generated key (e.g., `abc123def456...`)

### 6.2 Add to GitHub Secrets

1. Go to GitHub → Settings → Secrets → Actions
2. Click "New repository secret"
3. Name: `INDEXNOW_API_KEY`
4. Value: Paste your API key
5. Click "Add secret"

### 6.3 Test Notification

```bash
# Set environment variable locally
export INDEXNOW_API_KEY=your-api-key-here

# Run notification script
npm run notify-search-engines

# You should see:
# ✅ IndexNow submission successful (200)
# ✅ Google sitemap ping successful
```

## Step 7: Set Up Cloudflare Cache Purge (Optional)

Only needed if you're using Cloudflare CDN.

### 7.1 Get Zone ID

1. Log into Cloudflare dashboard
2. Select your domain
3. Scroll down on Overview page
4. Copy Zone ID from right sidebar

### 7.2 Create API Token

1. Go to My Profile → API Tokens
2. Click "Create Token"
3. Use "Edit zone DNS" template or create custom
4. Permissions: Zone → Cache Purge → Purge
5. Zone Resources: Include → Specific zone → skywardparts.com
6. Click "Continue to summary"
7. Click "Create Token"
8. Copy the token (only shown once!)

### 7.3 Add to GitHub Secrets

Add both:
- `CLOUDFLARE_ZONE_ID`: Your zone ID
- `CLOUDFLARE_API_TOKEN`: Your API token

### 7.4 Test Cache Purge

```bash
# Set environment variables locally
export CLOUDFLARE_ZONE_ID=your-zone-id
export CLOUDFLARE_API_TOKEN=your-token

# Run cache purge
npm run purge-sitemap-cache

# You should see:
# ✅ Batch 1/N: 30 URLs purged
# ✅ Total URLs purged: XXX
```

## Step 8: Verify Everything Works

```bash
# Run health check
npm run monitor-sitemaps

# You should see:
# ✅ Sitemap is fresh (X hours old)
# ✅ Sitemap structure is valid
# ✅ Sitemap is accessible (200)
# ✅ All checks passed - sitemap is healthy!
```

## Step 9: Monitor Recovery

### Week 1 (Oct 24-31, 2025)

**Daily Tasks:**
- Check GitHub Actions runs (should run at 2 AM UTC daily)
- Verify no workflow failures
- Monitor sitemap freshness: `npm run monitor-sitemaps`

**Expected Results:**
- Sitemaps regenerate daily ✅
- lastmod dates stay fresh ✅
- Bing/Yandex start crawling more (day 2-3)

### Week 2 (Nov 1-7, 2025)

**Weekly Tasks:**
- Check Google Search Console crawl stats
- Look for upward trend in crawl requests
- Monitor for any errors or issues

**Expected Results:**
- Google crawl rate starts increasing
- Should see 10k-20k requests/day by end of week
- No critical errors in GSC

### Week 3-4 (Nov 8-21, 2025)

**Weekly Tasks:**
- Continue monitoring GSC crawl stats
- Verify stable daily regeneration
- Check for any anomalies

**Expected Results:**
- Crawl rate continues climbing
- Should reach 40k-60k requests/day
- Approaching pre-drop levels

### Month 2 (Nov 22 - Dec 22, 2025)

**Monthly Tasks:**
- Verify full recovery to 67k+/day
- Review any patterns or issues
- Optimize if needed

**Expected Results:**
- Full recovery to 67k+/day ✅
- Stable, consistent crawl rate
- No more drops due to stale sitemaps

## Troubleshooting

### "No changes detected" when regenerating

**Problem:** Script says no changes but sitemaps are old

**Solution:**
```bash
# Force delete old sitemaps
rm public/sitemap*.xml

# Regenerate
npm run generate-sitemaps:safe
```

### GitHub Actions workflow not running

**Problem:** No automatic runs after 24 hours

**Solutions:**
1. Check if workflow file exists: `.github/workflows/regenerate-sitemaps.yml`
2. Verify Actions are enabled in repo settings
3. Check if secrets are configured
4. Look at Actions tab for error messages

### Database connection fails

**Problem:** "ECONNREFUSED" or timeout errors

**Solutions:**
1. Verify database credentials in GitHub Secrets
2. Check RDS security group allows connections
3. Test connection: `psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1"`
4. Contact AWS support if RDS is down

### Sitemaps not accessible

**Problem:** `npm run monitor-sitemaps` shows not accessible

**Solutions:**
1. Check if files exist: `ls -la public/sitemap*.xml`
2. Verify deployed to production
3. Test directly: `curl https://skywardparts.com/sitemap.xml`
4. Check nginx/server configuration
5. Review server logs

## Quick Reference Commands

```bash
# Daily monitoring (manual check)
npm run monitor-sitemaps

# Manual regeneration (with safety checks)
npm run generate-sitemaps:safe

# Notify search engines
npm run notify-search-engines

# Purge CDN cache
npm run purge-sitemap-cache

# Emergency rollback (if something breaks)
# Backups are in .sitemap-backups/backup-TIMESTAMP/
cp .sitemap-backups/backup-*/sitemap*.xml public/
```

## Success Criteria

You'll know the fix is working when:

1. ✅ Sitemaps regenerate daily (check GitHub Actions)
2. ✅ lastmod dates are < 24 hours old (check monitor-sitemaps)
3. ✅ Google crawl requests trending upward (check GSC)
4. ✅ No critical errors in monitoring
5. ✅ Crawl rate recovers to 50k-70k/day within 2-4 weeks

## Getting Help

If you encounter issues:

1. **Run health check first:**
   ```bash
   npm run monitor-sitemaps
   ```

2. **Check GitHub Actions logs:**
   - Go to Actions tab
   - Click on latest workflow run
   - Review logs for errors

3. **Review documentation:**
   - `SITEMAP_AUTOMATION.md` - Full documentation
   - `SITEMAP_SETUP.md` - This file

4. **Check application logs:**
   ```bash
   # On EC2 instance
   pm2 logs
   tail -f /var/log/nginx/access.log
   ```

---

**Setup Date:** October 24, 2025
**Last Sitemap Update:** August 13, 2025 (CRITICAL - 72 days old!)
**Target Recovery:** November 7-14, 2025
**Expected Crawl Rate:** 67,000+ requests/day

**URGENT:** Complete Steps 1-4 immediately to begin recovery process.
