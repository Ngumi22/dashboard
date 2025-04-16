import mysql from "mysql2/promise";

// Configuration with type safety
interface PoolConfig extends mysql.PoolOptions {
  host: string;
  user: string;
  password: string;
  database: string;
}

const slowQueryThreshold = 1000; // 1 second
const poolConfig: PoolConfig = {
  host: process.env.AWS_HOST || "",
  user: process.env.AWS_USER || "",
  password: process.env.AWS_PASSWORD || "",
  database: process.env.AWS_NAME || "bernzz",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 100,
  connectTimeout: 10000,
  idleTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  namedPlaceholders: true,
};

// Singleton pool with debug state
let pool: mysql.Pool | null = null;
let isShuttingDown = false;

// Debug counters
const connectionStats = {
  acquired: 0,
  released: 0,
  errors: 0,
};

/**
 * Initialize connection pool with enhanced safety
 */
export async function initDbConnection(): Promise<mysql.Pool> {
  if (isShuttingDown) {
    throw new Error("Cannot initialize pool during shutdown");
  }

  if (!pool) {
    pool = mysql.createPool(poolConfig);

    // Add comprehensive event listeners
    pool.on("acquire", (connection) => {
      connectionStats.acquired++;
      debugLog(`Connection acquired (ID: ${connection.threadId})`);
    });

    pool.on("release", (connection) => {
      connectionStats.released++;
      debugLog(`Connection released (ID: ${connection.threadId})`);
    });

    pool.on("enqueue", () => {
      debugLog("Waiting for available connection slot");
    });

    pool.on("connection", (connection) => {
      debugLog(`New connection established (ID: ${connection.threadId})`);
    });
  }

  // Verify pool health
  try {
    const testConn = await pool.getConnection();
    await testConn.ping();
    testConn.release();
    return pool;
  } catch (error) {
    await safePoolEnd();
    throw new Error(`Failed to initialize healthy connection pool: ${error}`);
  }
}

/**
 * Safely get a connection with timeout and health check
 */
export async function getConnection(
  timeoutMs = 5000
): Promise<mysql.PoolConnection> {
  if (!pool) {
    await initDbConnection();
  }

  if (!pool || isShuttingDown) {
    throw new Error("Connection pool not available");
  }

  try {
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), timeoutMs)
      ),
    ]);

    // Verify connection health
    await connection.ping();
    return connection;
  } catch (error) {
    connectionStats.errors++;
    throw new Error(`Failed to get healthy connection: ${error}`);
  }
}

/**
 * Enhanced query executor with complete safety
 */
export async function query<T = any>(
  sql: string,
  params: any[] | Record<string, any> = [],
  options: {
    timeoutMs?: number;
    connection?: mysql.PoolConnection;
  } = {}
): Promise<T> {
  const { timeoutMs = 10000, connection: externalConn } = options;
  const shouldRelease = !externalConn;
  let connection: mysql.PoolConnection | null = externalConn || null;

  try {
    if (!connection) {
      connection = await getConnection(timeoutMs);
    }

    const start = performance.now();
    const [results] = await Promise.race([
      connection.execute(sql, params),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), timeoutMs)
      ),
    ]);

    const duration = performance.now() - start;
    logQueryPerformance(sql, duration, params);

    return results as T;
  } catch (error) {
    connectionStats.errors++;
    throw new Error(`Query failed: ${sql} - ${error}`);
  } finally {
    if (connection && shouldRelease) {
      await safeReleaseConnection(connection);
    }
  }
}

/**
 * Robust transaction handler with deadlock retries
 */
export async function executeTransaction<T>(
  operation: (connection: mysql.PoolConnection) => Promise<T>,
  options: {
    retries?: number;
    delayMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { retries = 3, delayMs = 100, timeoutMs = 30000 } = options;
  let attempt = 0;
  let lastError: Error | null = null;
  let connection: mysql.PoolConnection | null = null;

  while (attempt < retries) {
    try {
      connection = await getConnection(timeoutMs);
      await connection.beginTransaction();

      const result = await Promise.race([
        operation(connection),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Transaction timeout")), timeoutMs)
        ),
      ]);

      await connection.commit();
      return result;
    } catch (error: any) {
      lastError = error;

      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          debugLog(`Rollback failed: ${rollbackError}`);
        }
      }

      if (error.message.includes("Deadlock") && attempt < retries - 1) {
        const waitTime = delayMs * (attempt + 1);
        debugLog(
          `Deadlock detected. Retrying in ${waitTime}ms... (${attempt + 1}/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    } finally {
      if (connection) {
        await safeReleaseConnection(connection);
        connection = null;
      }
    }

    attempt++;
  }

  throw new Error(`Transaction failed after ${retries} attempts: ${lastError}`);
}

/**
 * Database initialization with full cleanup
 */
export async function ensureDatabaseExists(): Promise<void> {
  const { AWS_NAME } = process.env;
  if (!AWS_NAME) {
    throw new Error(
      "Database name (AWS_NAME) is not set in environment variables"
    );
  }

  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await getConnection();
    await query(
      `CREATE DATABASE IF NOT EXISTS \`${AWS_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      [],
      { connection }
    );
    debugLog(`Database '${AWS_NAME}' ensured to exist`);
  } catch (error) {
    throw new Error(`Failed to ensure database exists: ${error}`);
  } finally {
    if (connection) {
      await safeReleaseConnection(connection);
    }
  }
}

/**
 * Graceful pool shutdown
 */
export async function closePool(): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (pool) {
    debugLog("Starting graceful pool shutdown...");
    debugLog(
      `Connection stats - Acquired: ${connectionStats.acquired}, Released: ${connectionStats.released}, Errors: ${connectionStats.errors}`
    );

    try {
      await pool.end();
      pool = null;
      debugLog("Pool closed gracefully");
    } catch (error) {
      throw new Error(`Failed to close pool: ${error}`);
    }
  }
}

// Helper functions
async function safeReleaseConnection(
  connection: mysql.PoolConnection
): Promise<void> {
  try {
    if (!isShuttingDown && connection && connection.release) {
      await connection.release();
    }
  } catch (error) {
    debugLog(`Error releasing connection: ${error}`);
  }
}

async function safePoolEnd(): Promise<void> {
  try {
    if (pool) {
      await pool.end();
    }
  } catch (error) {
    debugLog(`Error during pool termination: ${error}`);
  } finally {
    pool = null;
  }
}

function logQueryPerformance(sql: string, duration: number, params: any): void {
  if (duration > slowQueryThreshold) {
    const truncatedSql = sql.length > 100 ? `${sql.substring(0, 100)}...` : sql;
    debugLog(`Slow query (${duration.toFixed(2)}ms): ${truncatedSql}`);
  }
}

function debugLog(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[AWS] ${new Date().toISOString()} ${message}`);
  }
}

// Graceful shutdown handlers
const shutdownHandlers = async () => {
  debugLog("Shutdown signal received");
  try {
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdownHandlers);
process.on("SIGTERM", shutdownHandlers);

// Auto-cleanup on unhandled rejections
process.on("unhandledRejection", (reason) => {
  debugLog(`Unhandled rejection: ${reason}`);
});
