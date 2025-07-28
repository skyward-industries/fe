// Health check endpoint to diagnose connection issues
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      }
    },
    errors: []
  };

  // Check database connection
  let client;
  try {
    const startTime = Date.now();
    client = await pool.connect();
    
    // Simple query to verify connection
    await client.query('SELECT 1');
    
    health.database.connected = true;
    health.database.responseTime = Date.now() - startTime;
    
  } catch (error: any) {
    health.status = "error";
    health.database.connected = false;
    health.errors.push({
      component: "database",
      message: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }

  // Check if pool is saturated
  if (pool.waitingCount > 5) {
    health.status = "warning";
    health.errors.push({
      component: "pool",
      message: `High number of waiting connections: ${pool.waitingCount}`
    });
  }

  return NextResponse.json(health, {
    status: health.status === "ok" ? 200 : 503
  });
}