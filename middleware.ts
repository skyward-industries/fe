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
    const catalogPattern = /^\/catalog\/(\d+)\/([^\/]+)\/(\d+)\/(nsn-[^\/]+)\/(nsn-[\d-]+)$/;
    const match = pathname.match(catalogPattern);

    if (match) {
      const [, groupId, groupName, subgroupId, subgroupName, nsn] = match;

      // Remove "nsn-" prefixes from both subgroup name and NSN
      const cleanSubgroupName = subgroupName.replace(/^nsn-/, '');
      const cleanNsn = nsn.replace(/^nsn-/, '');

      // Construct new URL without "nsn-" prefixes
      const newUrl = new URL(req.url);
      newUrl.pathname = `/catalog/${groupId}/${groupName}/${subgroupId}/${cleanSubgroupName}/${cleanNsn}`;

      // 301 permanent redirect to new format
      return NextResponse.redirect(newUrl, 301);
    }

    // Also handle case where only NSN has the prefix
    const nsnOnlyPattern = /^\/catalog\/(\d+)\/([^\/]+)\/(\d+)\/([^\/]+)\/(nsn-[\d-]+)$/;
    const nsnMatch = pathname.match(nsnOnlyPattern);

    if (nsnMatch) {
      const [, groupId, groupName, subgroupId, subgroupName, nsn] = nsnMatch;

      // Check if subgroup or nsn starts with nsn-
      const cleanSubgroupName = subgroupName.replace(/^nsn-/, '');
      const cleanNsn = nsn.replace(/^nsn-/, '');

      // Only redirect if something was changed
      if (subgroupName !== cleanSubgroupName || nsn !== cleanNsn) {
        const newUrl = new URL(req.url);
        newUrl.pathname = `/catalog/${groupId}/${groupName}/${subgroupId}/${cleanSubgroupName}/${cleanNsn}`;

        // 301 permanent redirect to new format
        return NextResponse.redirect(newUrl, 301);
      }
    }
  }

  return NextResponse.next();
}

// ✅ Apply middleware to all routes EXCEPT sitemap
export const config = {
  matcher: ["/((?!sitemap).*)"], // Excludes `/sitemap*` from middleware processing
};