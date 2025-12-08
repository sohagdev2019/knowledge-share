import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";

/**
 * Health check endpoint for database connectivity
 * GET /api/health/db
 * 
 * Returns database connection status and latency
 */
export async function GET() {
  try {
    const health = await checkDatabaseConnection();
    
    if (health.connected) {
      return NextResponse.json(
        {
          status: "healthy",
          database: "connected",
          latency: `${health.latency}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: health.error,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "unknown",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
