import mysql from "mysql2/promise";

let slowQueryThreshold = 1000; // in ms, adjust as needed

// Global variables to track the pool and connections
let pool: mysql.Pool | null = null;
let activeConnections = 0;
let totalConnectionsCreated = 0;

/**
 * Ensures the database exists. If it doesn't, creates it.
 */
async function ensureDatabaseExists(): Promise<void> {
  const { AWS_HOST, AWS_USER, AWS_PASSWORD, AWS_NAME } = process.env;

  if (!AWS_NAME) {
    throw new Error(
      "Database name (AWS_NAME) is not set in environment variables."
    );
  }

  // Create a temporary connection without specifying a database
  const connection = await mysql.createConnection({
    host: AWS_HOST!,
    user: AWS_USER!,
    password: AWS_PASSWORD!,
  });

  try {
    // Ensure the database exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${AWS_NAME}\`;`);
    console.log(`Database '${AWS_NAME}' ensured to exist.`);
  } catch (error) {
    console.error("Error ensuring database existence:", error);
    throw error;
  } finally {
    await connection.end(); // Close the temporary connection
  }
}

/**
 * Initializes the database connection pool (singleton pattern).
 */
export async function initDbConnection(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool({
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
    });

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
export async function query(sql: string, params: any[] = []): Promise<any> {
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
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Closes the database pool (for cleanup).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Database pool closed.");
  }
}
