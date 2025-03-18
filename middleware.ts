import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Skip middleware processing for sitemap requests
  if (pathname.startsWith("/sitemap") || pathname.endsWith(".xml")) {
    return NextResponse.next({
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return NextResponse.next();
}

// ✅ Apply middleware to all routes EXCEPT sitemap
export const config = {
  matcher: ["/((?!sitemap).*)"], // Excludes `/sitemap*` from middleware processing
};