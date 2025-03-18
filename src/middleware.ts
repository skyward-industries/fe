import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/robots.txt") {
    return NextResponse.rewrite(new URL("/robots.txt", req.url));
  }
  if (req.nextUrl.pathname === "/sitemap.xml") {
    return NextResponse.rewrite(new URL("/sitemap-index.xml", req.url));
  }

  return NextResponse.next();
}
