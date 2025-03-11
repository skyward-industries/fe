import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Match "/sitemap-group-xxx.xml" or "/sitemap-subgroup-xxx.xml"
  if (url.pathname.startsWith("/sitemap-group-") && url.pathname.endsWith(".xml")) {
    const id = url.pathname.replace("/sitemap-group-", "").replace(".xml", "");
    return NextResponse.rewrite(new URL(`/sitemap-group/${id}`, req.url));
  }

  if (url.pathname.startsWith("/sitemap-subgroup-") && url.pathname.endsWith(".xml")) {
    const id = url.pathname.replace("/sitemap-subgroup-", "").replace(".xml", "");
    return NextResponse.rewrite(new URL(`/sitemap-subgroup/${id}`, req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to sitemap routes
export const config = {
  matcher: ["/sitemap-group-*.xml", "/sitemap-subgroup-*.xml"],
};
