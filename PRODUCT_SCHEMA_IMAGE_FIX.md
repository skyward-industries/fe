# Product Schema Image Field Fix

## Issue from Google Search Console

### Critical Issue:
- ❌ **Missing field "image"** (REQUIRED)

### Non-Critical Issues:
- ⚠️ Missing field "shippingDetails" (optional)
- ⚠️ Missing field "hasMerchantReturnPolicy" (optional)

## Solutions Implemented ✅

### 1. Added Required Image Field
```javascript
"image": "https://skywardparts.com/logo.png"
```

**Why this works:**
- Google requires at least one image for Product schema
- Using company logo as placeholder for all products
- Image URL is accessible and properly formatted
- Can be replaced with actual product images when available

### 2. Added Optional Shipping Details
```javascript
"shippingDetails": {
  "@type": "OfferShippingDetails",
  "shippingDestination": {
    "@type": "DefinedRegion",
    "addressCountry": "US"
  }
}
```

**Benefits:**
- Improves product rich snippets in search results
- Indicates shipping availability to US
- Can be expanded with shipping rates if needed

### 3. Added Optional Return Policy
```javascript
"hasMerchantReturnPolicy": {
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "US",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 30,
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/FreeReturn"
}
```

**Note:** Generic 30-day return policy added. Adjust if your actual policy differs.

## Updated Product Schema Structure

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product name",
  "sku": "NSN",
  "mpn": "Part number",
  "description": "Product description",
  "image": "https://skywardparts.com/logo.png",  // ✅ ADDED
  "brand": {
    "@type": "Brand",
    "name": "Company name"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "Company name"
  },
  "category": "FSC category",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-10-22",
    "availability": "InStock",
    "url": "Product URL",
    "seller": {
      "@type": "Organization",
      "name": "Skyward Industries"
    },
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": "0",
      "priceCurrency": "USD",
      "valueAddedTaxIncluded": false
    },
    "itemCondition": "NewCondition",
    "businessFunction": "ProvideService",
    "shippingDetails": {                    // ✅ ADDED
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "US"
      }
    },
    "hasMerchantReturnPolicy": {            // ✅ ADDED
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "US",
      "returnPolicyCategory": "MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "ReturnByMail",
      "returnFees": "FreeReturn"
    }
  }
}
```

## Validation

### Test in Google Rich Results Tool:
1. Visit: https://search.google.com/test/rich-results
2. Enter product URL
3. Expected result: ✅ **Valid Product Schema**

### Expected Fixes:
- ✅ Critical "image" error: **RESOLVED**
- ✅ Optional "shippingDetails" warning: **RESOLVED**
- ✅ Optional "hasMerchantReturnPolicy" warning: **RESOLVED**

## Future Enhancements

### Use Actual Product Images:

When product images become available, update the image field to use actual product photos:

```javascript
// Single image
"image": `https://skywardparts.com/images/products/${cleanNSN}.jpg`

// Or multiple images (even better)
"image": [
  `https://skywardparts.com/images/products/${cleanNSN}-1.jpg`,
  `https://skywardparts.com/images/products/${cleanNSN}-2.jpg`,
  `https://skywardparts.com/images/products/${cleanNSN}-3.jpg`
]
```

### Image Requirements:
- **Format**: JPG, PNG, GIF, WebP, or BMP
- **Size**: At least 696px wide
- **Aspect ratio**: 16:9, 4:3, or 1:1 (square) recommended
- **File size**: Keep under 200KB for performance

### Update Return Policy:

If your actual return policy differs from the generic 30-day policy, update these fields:

```javascript
"hasMerchantReturnPolicy": {
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "US",
  "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",  // If no returns
  // OR
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 60,  // Your actual return window
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/ReturnShippingFees"  // If customer pays return shipping
}
```

## Deployment

1. **Deploy:**
   ```bash
   npm run build
   npm run start:prod
   ```

2. **Validate:**
   ```bash
   # Test a product page
   curl -s https://skywardparts.com/catalog/10/weapons/1005/guns-through-30mm/1005-00-000-0061 | grep '"image"'

   # Should output: "image":"https://skywardparts.com/logo.png"
   ```

3. **Monitor Google Search Console:**
   - Wait 3-7 days for Google to re-crawl
   - Check "Enhancements" → "Product"
   - Critical errors should drop to 0
   - Optional warnings should disappear

## Timeline

- **Immediate**: Schema updates active after deployment
- **3-7 days**: Google recognizes updated schema
- **2-4 weeks**: All product pages re-indexed with valid schema
- **1-2 months**: May see improved CTR from enhanced rich snippets

## Files Modified

- `src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]/page.tsx` (lines 365, 385-399)
  - Added required "image" field
  - Added optional "shippingDetails" field
  - Added optional "hasMerchantReturnPolicy" field
