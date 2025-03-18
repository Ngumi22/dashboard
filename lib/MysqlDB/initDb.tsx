import mysql from "mysql2/promise";

// Configuration
const slowQueryThreshold = 1000; // in ms, adjust as needed
const poolConfig = {
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD,
  database: process.env.AWS_NAME,
  waitForConnections: true, // Allow queuing when the pool is full
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 100, // Maximum number of queued requests
  connectTimeout: 5000, // Timeout for acquiring a connection
  idleTimeout: 30000, // Close idle connections after 30 seconds
  enableKeepAlive: true,
  namedPlaceholders: true, // Enable named placeholders for safer queries
};

// Singleton pool instance
let pool: mysql.Pool | null = null;

/**
 * Ensures the database exists. If it doesn't, creates it.
 */
export async function ensureDatabaseExists(): Promise<void> {
  const { AWS_NAME } = process.env;

  if (!AWS_NAME) {
    throw new Error(
      "Database name (AWS_NAME) is not set in environment variables."
    );
  }

  try {
    // Use the pool to check and create the database
    const connection = await getConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${AWS_NAME}\`;`);
    console.log(`Database '${AWS_NAME}' ensured to exist.`);
  } catch (error) {
    console.error("Error ensuring database existence:", error);
    throw error;
  }
}

/**
 * Initializes the database connection pool (singleton pattern).
 */
export async function initDbConnection(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool(poolConfig);

    console.log("Database pool initialized successfully.");

    // Monitor the connection pool
    pool.on("enqueue", () => {
      console.warn("Connection pool is full. Requests are being queued.");
    });

    pool.on("release", (connection) => {
      console.log("Connection released back to the pool.");
    });

    pool.on("acquire", (connection) => {
      console.log("Connection acquired from the pool.");
    });

    // Ensure the database exists after initializing the pool
    await ensureDatabaseExists();
  }

  return pool;
}

/**
 * Gets a connection from the pool.
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  if (!pool) {
    await initDbConnection();
  }

  if (!pool) {
    throw new Error("Database pool is not initialized");
  }

  return pool.getConnection();
}

/**
 * Executes a query and logs performance.
 */
export async function query(
  sql: string,
  params: any[] | Record<string, any> = []
): Promise<any> {
  if (!pool) {
    await initDbConnection();
  }

  const connection = await pool!.getConnection();
  try {
    const start = performance.now();
    const [results] = await connection.execute(sql, params);
    const duration = performance.now() - start;

    // Log query performance
    if (duration > slowQueryThreshold) {
      console.warn(
        `Slow query detected: ${sql}, duration: ${duration.toFixed(2)} ms`
      );
    }

    return results;
  } catch (error) {
    console.error("Database error:", error);
    throw error; // Re-throw the error without wrapping
  } finally {
    connection.release(); // Always release the connection back to the pool
  }
}

/**
 * Executes a transaction with automatic rollback on failure and retries on deadlocks.
 */
export async function executeTransaction<T>(
  operation: (connection: mysql.PoolConnection) => Promise<T>,
  retries = 3
): Promise<T> {
  if (!pool) {
    await initDbConnection();
  }

  const connection = await pool!.getConnection();
  let attempt = 0;

  while (attempt < retries) {
    try {
      await connection.beginTransaction();
      const result = await operation(connection);
      await connection.commit();
      return result;
    } catch (error: any) {
      await connection.rollback();

      if (error.message.includes("Deadlock") && attempt < retries - 1) {
        console.warn(
          `Deadlock detected. Retrying... (${attempt + 1}/${retries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * (attempt + 1))
        );
      } else {
        console.error("Transaction failed:", error);
        throw error; // Re-throw the error without wrapping
      }
    } finally {
      connection.release(); // Always release the connection back to the pool
    }

    attempt++;
  }

  throw new Error("Max retries reached for transaction.");
}

/**
 * Closes the database pool (for graceful shutdown).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Database pool closed gracefully.");
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});
