import requests
import time

# Test just the first 10 valid ranges from your analysis
test_ranges = [
    (1, 3000),           # Should have 7 NSNs
    (363001, 366000),    # Should have 902 NSNs  
    (366001, 369000),    # Should have 1224 NSNs
    (369001, 372000),    # Should have 1289 NSNs
    (372001, 375000),    # Should have 1304 NSNs
]

print("🧪 Testing valid ranges from database analysis...")

for start, end in test_ranges:
    try:
        print(f"\nTesting range {start:,}-{end:,}...")
        url = f"https://skywardparts.com/sitemap/{start}/{end}.xml"
        
        start_time = time.time()
        response = requests.get(url, timeout=15)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            url_count = response.text.count('<url>')
            print(f"✅ SUCCESS: {url_count} URLs in {response_time:.0f}ms")
        else:
            print(f"❌ HTTP {response.status_code} in {response_time:.0f}ms")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

print("\n🎯 If these work, your sitemap optimization is successful!")
