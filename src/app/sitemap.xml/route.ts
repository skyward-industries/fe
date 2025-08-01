import { readFileSync } from 'fs';
import { join } from 'path';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    // Serve the static sitemap.xml file generated by the build script
    const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
    const sitemap = readFileSync(sitemapPath, 'utf-8');

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "X-Static-Sitemap": "true",
      },
    });
  } catch (error) {
    // Fallback to empty sitemap if static file doesn't exist
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new Response(emptySitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "X-Fallback": "true",
      },
    });
  }
}
