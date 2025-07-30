// Streaming sitemap API for large datasets
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";

const BATCH_SIZE = 500; // Stream in smaller batches
const MAX_PARTS = 10000; // Allow larger requests for streaming

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "3000"), MAX_PARTS);
  const offset = parseInt(searchParams.get("offset") || "0");
  
  const startId = offset + 1;
  const endId = offset + limit;
  
  console.log(`🌊 Streaming Sitemap API: range ${startId.toLocaleString()}-${endId.toLocaleString()}`);
  
  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let client;
      
      try {
        client = await pool.connect();
        await client.query(`SET statement_timeout = 60000`); // 60 seconds for streaming
        
        // Start JSON array
        controller.enqueue(encoder.encode('[\n'));
        
        let currentOffset = 0;
        let hasMore = true;
        let isFirst = true;
        
        while (hasMore && currentOffset < limit) {
          const batchStartId = startId + currentOffset;
          const batchEndId = Math.min(batchStartId + BATCH_SIZE - 1, endId);
          
          // Query for batch
          const query = `
            SELECT 
              pi.fsg,
              pi.fsc,
              pi.nsn,
              fsgs.fsg_title,
              fsgs.fsc_title
            FROM part_info pi
            INNER JOIN wp_fsgs_new fsgs ON pi.fsg = fsgs.fsg
            WHERE pi.id >= $1 
              AND pi.id <= $2
              AND pi.nsn IS NOT NULL 
              AND pi.nsn != ''
              AND fsgs.fsg_title IS NOT NULL 
              AND fsgs.fsc_title IS NOT NULL
            ORDER BY pi.id
            LIMIT $3
          `;
          
          const result = await client.query(query, [
            batchStartId, 
            batchEndId, 
            BATCH_SIZE
          ]);
          
          // Stream each row
          for (const row of result.rows) {
            if (!isFirst) {
              controller.enqueue(encoder.encode(',\n'));
            }
            controller.enqueue(encoder.encode(JSON.stringify(row)));
            isFirst = false;
          }
          
          // Check if we have more data
          hasMore = result.rows.length === BATCH_SIZE;
          currentOffset += BATCH_SIZE;
          
          // Small delay to prevent overwhelming
          if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        // Close JSON array
        controller.enqueue(encoder.encode('\n]'));
        controller.close();
        
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      } finally {
        if (client) {
          client.release();
        }
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Transfer-Encoding': 'chunked'
    }
  });
}