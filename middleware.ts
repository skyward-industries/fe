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

  // ✅ Redirect old URL format with "nsn-" prefixes to new format
  // Old: /catalog/.../nsn-subgroup-name/nsn-1234-56-789-0123
  // New: /catalog/.../subgroup-name/1234-56-789-0123
  if (pathname.startsWith("/catalog/")) {
    // Check if URL contains nsn- prefix in either subgroup or NSN segment
    if (pathname.includes("/nsn-")) {
      const catalogPattern = /^\/catalog\/(\d+)\/([^\/]+)\/(\d+)\/([^\/]+)\/([^\/]+)$/;
      const match = pathname.match(catalogPattern);

      if (match) {
        const [, groupId, groupName, subgroupId, subgroupName, nsn] = match;

        // Remove "nsn-" prefixes from both subgroup name and NSN
        const cleanSubgroupName = subgroupName.replace(/^nsn-/, '');
        const cleanNsn = nsn.replace(/^nsn-/, '');

        // Only redirect if something actually changed
        if (cleanSubgroupName !== subgroupName || cleanNsn !== nsn) {
          const newUrl = new URL(req.url);
          newUrl.pathname = `/catalog/${groupId}/${groupName}/${subgroupId}/${cleanSubgroupName}/${cleanNsn}`;

          // 301 permanent redirect to new format
          return NextResponse.redirect(newUrl, 301);
        }
      }
    }
  }

  return NextResponse.next();
}

// ✅ Apply middleware to catalog routes and exclude static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap (sitemap files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap).*)',
  ],
};