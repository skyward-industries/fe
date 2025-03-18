import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow sitemaps to bypass middleware processing
  if (
    pathname.startsWith("/sitemap-") || 
    pathname.startsWith("/api/sitemap") || 
    pathname.endsWith(".xml")
  ) {
    return NextResponse.next();
  }

  // ✅ Ensure Google gets the correct sitemap index file
  if (pathname === "/sitemap.xml") {
    return NextResponse.rewrite(new URL("/api/sitemap-index.xml", req.url));
  }

  return NextResponse.next();
}
