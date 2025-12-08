import { PrismaClient } from "./generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Optimize DATABASE_URL for Neon connection pooling
// Neon pooler requires specific connection string format
function getOptimizedDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // If using Neon and URL doesn't already have pooler params, add them
  if (dbUrl.includes("neon.tech") && !dbUrl.includes("?") && !dbUrl.includes("pooler")) {
    // Check if it's already a pooler URL
    if (!dbUrl.includes("-pooler")) {
      // Convert to pooler URL if not already
      const poolerUrl = dbUrl.replace(
        /@([^/]+)\/([^?]+)/,
        "@$1-pooler/$2?sslmode=require&pgbouncer=true"
      );
      return poolerUrl;
    }
    // Add connection pool parameters if not present
    const separator = dbUrl.includes("?") ? "&" : "?";
    return `${dbUrl}${separator}sslmode=require&connect_timeout=10&pool_timeout=20`;
  }
  
  // For non-Neon databases, add timeout parameters
  if (!dbUrl.includes("?")) {
    return `${dbUrl}?connect_timeout=10&pool_timeout=20`;
  }
  
  return dbUrl;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
    datasources: {
      db: {
        url: getOptimizedDatabaseUrl(),
      },
    },
    // Note: Connection pool settings are configured via connection string parameters
    // (connect_timeout, pool_timeout) which are added in getOptimizedDatabaseUrl()
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Handle connection cleanup on process termination
// Only register in Node.js runtime (not available in Edge runtime)
// Check if we're in Node.js runtime (not Edge runtime)
const isNodeRuntime = 
  typeof process !== "undefined" &&
  typeof process.on === "function" &&
  typeof process.exit === "function" &&
  !(globalThis as any).EdgeRuntime; // Edge runtime marker

if (isNodeRuntime) {
  try {
    process.on("beforeExit", async () => {
      await prisma.$disconnect();
    });
    
    // Also handle SIGINT and SIGTERM for graceful shutdown
    process.on("SIGINT", async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    // Silently fail if process.on is not available (Edge runtime)
    // Connection cleanup will happen automatically when Prisma client is garbage collected
  }
}

// Connection health check utility
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  latency?: number;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Retry wrapper for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if it's a connection error that might be retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable =
        errorMessage.includes("Can't reach database server") ||
        errorMessage.includes("connection pool") ||
        errorMessage.includes("P1001") || // Prisma connection error code
        errorMessage.includes("P1008") || // Prisma operation timeout
        errorMessage.includes("Timed out") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ETIMEDOUT");
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delayMs * Math.pow(2, attempt - 1);
      console.warn(
        `Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`,
        errorMessage
      );
      
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}
