import { NextResponse } from "next/server";
import { getPartsByNSN } from "@/lib/db";

// Simple rate limiting to prevent database overload
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // Max 30 requests per minute per IP

function getRateLimitKey(req: Request): string {
  // Try to get IP from various headers (for production behind proxies)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rateLimitData = requestCounts.get(ip);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Reset or initialize rate limit
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (rateLimitData.count >= RATE_LIMIT_MAX) {
    return true;
  }
  
  rateLimitData.count++;
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: { nsn: string } }
) {
  const rawNsn = params.nsn;
  const nsn = rawNsn.replace(/-/g, "");

  console.log(`📥 Incoming request for NSN: ${rawNsn} → ${nsn}`);

  // Rate limiting check
  const clientIp = getRateLimitKey(req);
  if (isRateLimited(clientIp)) {
    console.warn(`🚫 Rate limited request from ${clientIp} for NSN: ${nsn}`);
    return NextResponse.json({
      error: "Rate limit exceeded",
      detail: "Too many requests. Please try again later.",
    }, { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
        'X-RateLimit-Window': (RATE_LIMIT_WINDOW / 1000).toString()
      }
    });
  }

  try {
    const startTime = Date.now();
    
    // Use the optimized cached function from db.js
    const parts = await getPartsByNSN(nsn);
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ PartInfo API completed in ${totalTime}ms for NSN: ${nsn}`);

    if (parts.length === 0) {
      return NextResponse.json({
        error: "NSN not found",
        detail: `No records found for NSN: ${rawNsn}`,
      }, { status: 404 });
    }

    // Add empty characteristics array for compatibility
    const partsWithCharacteristics = parts.map((part: any) => ({
      ...part,
      characteristics: [] // Empty for now - can be populated separately if needed
    }));

    return NextResponse.json(partsWithCharacteristics, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600', // Cache for 5-10 minutes
        'X-Query-Time': totalTime.toString(),
        'X-Parts-Count': parts.length.toString(),
        'X-Cached': 'true'
      }
    });
  } catch (error: any) {
    console.error(`❌ PartInfo API error for NSN: ${rawNsn} - ${error.message}`);
    return NextResponse.json({
      error: "Database error",
      detail: "Failed to fetch part information. Please try again later.",
    }, { status: 500 });
  }
}