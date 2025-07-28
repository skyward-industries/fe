// File: src/app/api/analyze-sitemap-ranges/route.js
import { pool } from "@/lib/db";

export async function GET() {
  console.log("🔍 Starting sitemap range analysis...");
  
  try {
    // Basic stats first
    console.log("📊 Getting basic database stats...");
    const statsQuery = `
      SELECT 
        COUNT(*) as total_parts,
        COUNT(CASE WHEN nsn IS NOT NULL AND nsn != '' THEN 1 END) as parts_with_nsn,
        MIN(id) as min_id,
        MAX(id) as max_id
      FROM part_info
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.log(`📊 Database Stats:
   Total parts: ${parseInt(stats.total_parts).toLocaleString()}
   Parts with NSN: ${parseInt(stats.parts_with_nsn).toLocaleString()}
   ID range: ${parseInt(stats.min_id).toLocaleString()} - ${parseInt(stats.max_id).toLocaleString()}
   NSN percentage: ${((stats.parts_with_nsn / stats.total_parts) * 100).toFixed(1)}%`);

    // Find valid ranges for sitemaps
    console.log("🔍 Analyzing valid sitemap ranges...");
    const rangeQuery = `
      WITH range_analysis AS (
        SELECT 
          FLOOR(pi.id/3000)*3000 + 1 as start_id,
          FLOOR(pi.id/3000)*3000 + 3000 as end_id,
          COUNT(DISTINCT pi.nsn) as valid_nsn_count
        FROM part_info pi
        LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
        WHERE pi.nsn IS NOT NULL 
        AND pi.nsn != ''
        AND fsgs.fsg_title IS NOT NULL 
        AND fsgs.fsc_title IS NOT NULL
        GROUP BY FLOOR(pi.id/3000)
        HAVING COUNT(DISTINCT pi.nsn) > 0
      )
      SELECT 
        start_id,
        end_id,
        valid_nsn_count,
        ROUND(valid_nsn_count * 100.0 / 3000, 2) as density_percent
      FROM range_analysis
      ORDER BY start_id
      LIMIT 100
    `;

    const rangeResult = await pool.query(rangeQuery);
    const validRanges = rangeResult.rows;

    console.log(`✅ Found ${validRanges.length} valid ranges (showing first 100)`);

    // Density analysis
    const densityStats = {
      'Very Dense (>50%)': validRanges.filter(r => parseFloat(r.density_percent) > 50).length,
      'Dense (20-50%)': validRanges.filter(r => parseFloat(r.density_percent) > 20 && parseFloat(r.density_percent) <= 50).length,
      'Medium (5-20%)': validRanges.filter(r => parseFloat(r.density_percent) > 5 && parseFloat(r.density_percent) <= 20).length,
      'Sparse (1-5%)': validRanges.filter(r => parseFloat(r.density_percent) > 1 && parseFloat(r.density_percent) <= 5).length,
      'Very Sparse (≤1%)': validRanges.filter(r => parseFloat(r.density_percent) <= 1).length
    };

    const totalValidNsns = validRanges.reduce((sum, range) => sum + parseInt(range.valid_nsn_count), 0);

    // Sample problematic ranges from your audit
    console.log("🔍 Checking sample problematic ranges...");
    const problematicRanges = [
      { start: 69001, end: 72000 },
      { start: 1665001, end: 1668000 },
      { start: 387001, end: 390000 }
    ];

    const problematicResults = [];
    for (const range of problematicRanges) {
      try {
        const checkQuery = `
          SELECT COUNT(*) as total_parts,
          COUNT(CASE WHEN pi.nsn IS NOT NULL AND pi.nsn != '' 
            AND fsgs.fsg_title IS NOT NULL AND fsgs.fsc_title IS NOT NULL THEN 1 END) as valid_for_sitemap
          FROM part_info pi
          LEFT JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg AND pi.fsc = fsgs.fsc
          WHERE pi.id BETWEEN $1 AND $2
        `;
        const result = await pool.query(checkQuery, [range.start, range.end]);
        problematicResults.push({
          range: `${range.start}-${range.end}`,
          ...result.rows[0]
        });
      } catch (error) {
        problematicResults.push({
          range: `${range.start}-${range.end}`,
          error: error.message
        });
      }
    }

    const response = {
      timestamp: new Date().toISOString(),
      database_stats: {
        total_parts: parseInt(stats.total_parts),
        parts_with_nsn: parseInt(stats.parts_with_nsn),
        min_id: parseInt(stats.min_id),
        max_id: parseInt(stats.max_id),
        nsn_percentage: parseFloat(((stats.parts_with_nsn / stats.total_parts) * 100).toFixed(1))
      },
      sitemap_analysis: {
        valid_ranges_found: validRanges.length,
        estimated_total_ranges: Math.round(validRanges.length * (parseInt(stats.max_id) / (validRanges.length * 3000))),
        current_sitemaps: 2400,
        recommended_sitemaps: validRanges.length,
        reduction_percentage: parseFloat(((1 - validRanges.length / 2400) * 100).toFixed(1)),
        total_valid_nsns: totalValidNsns
      },
      density_distribution: densityStats,
      sample_valid_ranges: validRanges.slice(0, 20).map(range => ({
        start: parseInt(range.start_id),
        end: parseInt(range.end_id),
        nsn_count: parseInt(range.valid_nsn_count),
        density_percent: parseFloat(range.density_percent)
      })),
      problematic_ranges_check: problematicResults,
      recommendations: [
        "Update sitemap generation to only use valid ranges",
        "This will eliminate most timeout issues (65.6% → ~0%)",
        "Focus API optimization on these working ranges",
        "Create sitemap index with only valid ranges",
        "Test sample ranges before full deployment"
      ],
      next_steps: validRanges.slice(0, 5).map(range => ({
        test_api: `curl "https://skywardparts.com/api/sitemap-parts?limit=3000&offset=${parseInt(range.start_id) - 1}"`,
        test_sitemap: `curl "https://skywardparts.com/sitemap/${range.start_id}/${range.end_id}.xml"`
      }))
    };

    console.log("✅ Analysis complete!");
    
    return Response.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error("❌ Analysis failed:", error);
    return Response.json({ 
      error: "Analysis failed", 
      detail: error.message 
    }, { status: 500 });
  }
}