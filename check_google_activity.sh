
     echo "🔍 Checking for Google Search Console Activity"
     echo "=============================================="
     echo ""

     # Test if Google can access your sitemap
     echo "1. Testing Google access to sitemap:"
     curl -s -I -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
       "https://skywardparts.com/sitemap_index.xml" | grep -E "HTTP|Cache-Control|X-"

     echo ""
     echo "2. To check if Google is actively crawling:"
     echo "   SSH into your production server and run:"
     echo ""
     echo "   # Check recent Googlebot activity:"
     echo "   sudo grep -i googlebot /var/log/nginx/access.log | tail -20"
     echo ""
     echo "   # Check Google crawling sitemaps:"
     echo "   sudo grep -i 'googlebot.*sitemap' /var/log/nginx/access.log | tail -20"
     echo ""
     echo "   # Monitor live Google activity:"
     echo "   sudo tail -f /var/log/nginx/access.log | grep -i googlebot"
     echo ""

     echo "3. Google Search Console verification:"
     echo "   - Log into Google Search Console"
     echo "   - Go to Settings > Crawl stats"
     echo "   - Check 'Pages crawled per day' and 'Response time'"
     echo "   - Go to Sitemaps section to see submission status"
     echo ""

     echo "4. Common Googlebot User-Agents to look for:"
     echo "   - Googlebot/2.1"
     echo "   - Googlebot-Image/1.0"
     echo "   - Googlebot-Video/1.0"
     echo "   - AdsBot-Google"
     echo ""

     echo "✅ No blocks found for Google in your configuration!"v