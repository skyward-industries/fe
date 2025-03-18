import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // // Match URLs like /sitemap-1-50000.xml and rewrite to /api/sitemap/1/50000
  // const match = url.pathname.match(/^\/sitemap-(\d+)-(\d+)\.xml$/);
  // if (match) {
  //   const startRange = match[1]; // Extract start of the range
  //   const endRange = match[2]; // Extract end of the range
  //   return NextResponse.rewrite(new URL(`/api/sitemap/${startRange}/${endRange}`, req.url));
  // }
  if (req.nextUrl.pathname === "/robots.txt") {
    return NextResponse.rewrite(new URL("/api/robots.txt", req.url));
  }
  if (req.nextUrl.pathname === "/sitemap.xml") {
    return NextResponse.rewrite(new URL("/api/sitemap-index.xml", req.url));
  }

  return NextResponse.next();
}
