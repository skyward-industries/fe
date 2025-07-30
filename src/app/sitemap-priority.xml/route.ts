// High-priority parts sitemap for faster indexing
export const dynamic = 'force-dynamic';

import { pool } from '@/lib/db';
import { slugify } from '@/utils/slugify';

type PriorityPart = {
  fsg: string;
  fsc: string;
  fsg_title: string;
  fsc_title: string;
  nsn: string;
};

function generatePrioritySitemap(parts: PriorityPart[]) {
  const baseUrl = "https://skywardparts.com";
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parts
  .filter((part) => part.fsg_title && part.fsc_title && part.nsn)
  .map((part) => {
    const fsgSlug = slugify(part.fsg_title);
    const fscSlug = slugify(part.fsc_title);
    const formattedNsn = formatNSN(part.nsn);
    
    return `  <url>
    <loc>${baseUrl}/catalog/${part.fsg}/${fsgSlug}/${part.fsc}/${fscSlug}/${formattedNsn}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;
}

function formatNSN(nsn: string): string {
  if (nsn && nsn.length === 13) {
    return `${nsn.slice(0, 4)}-${nsn.slice(4, 6)}-${nsn.slice(6, 9)}-${nsn.slice(9)}`;
  }
  return nsn;
}

export async function GET() {
  try {
    console.log('🎯 Generating priority sitemap...');
    
    // Get high-priority parts - most searched FSCs, recent parts, etc.
    const query = `
      SELECT DISTINCT p.fsg, p.fsc, f1.title as fsg_title, f2.title as fsc_title, p.nsn
      FROM part_info p
      LEFT JOIN wp_fsgs f1 ON p.fsg = f1.fsg
      LEFT JOIN wp_fsgs f2 ON p.fsc::text = f2.fsg
      WHERE p.fsg IN ('15', '16', '53', '58', '59', '61', '91', '99') -- High-value FSGs
        AND p.nsn IS NOT NULL 
        AND LENGTH(p.nsn) = 13
        AND f1.title IS NOT NULL 
        AND f2.title IS NOT NULL
      ORDER BY p.fsg, p.fsc, p.nsn
      LIMIT 50000
    `;
    
    const result = await pool.query(query);
    const prioritySitemap = generatePrioritySitemap(result.rows);
    
    console.log(`✅ Priority sitemap generated with ${result.rows.length} high-priority parts`);
    
    return new Response(prioritySitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // 1 hour cache
      },
    });
    
  } catch (error) {
    console.error('❌ Error generating priority sitemap:', error);
    return new Response('Error generating priority sitemap', { status: 500 });
  }
}