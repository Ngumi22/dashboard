import mysql from "mysql2/promise";
import { performance } from "perf_hooks";

let slowQueryThreshold = 1000; // in ms, adjust as needed

let pool: mysql.Pool | null = null;
let activeConnections = 0;
let totalConnectionsCreated = 0;

/**
 * Ensures the database exists. If it doesn't, creates it.
 */
async function ensureDatabaseExists(): Promise<void> {
  const { DTB_HOST, DTB_USER, DTB_PASSWORD, DTB_NAME } = process.env;

  if (!DTB_NAME) {
    throw new Error(
      "Database name (DTB_NAME) is not set in environment variables."
    );
  }

  // Create a temporary connection without specifying a database
  const connection = await mysql.createConnection({
    host: DTB_HOST!,
    user: DTB_USER!,
    password: DTB_PASSWORD!,
  });

  try {
    // Ensure the database exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DTB_NAME}\`;`);
    console.log(`Database '${DTB_NAME}' ensured to exist.`);
  } catch (error) {
    console.error("Error ensuring database existence:", error);
    throw error;
  } finally {
    await connection.end(); // Close the temporary connection
  }
}

/**
 * Initializes the database connection pool.
 */
export async function initDbConnection(): Promise<mysql.Pool> {
  if (!pool) {
    await ensureDatabaseExists(); // Ensure the database exists before initializing the pool

    pool = mysql.createPool({
      host: process.env.DTB_HOST!,
      user: process.env.DTB_USER!,
      password: process.env.DTB_PASSWORD!,
      database: process.env.DTB_NAME!,
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0,
    });

    console.log("Database pool initialized successfully.");

    // Track total connections created
    pool.on("connection", () => {
      totalConnectionsCreated++;
    });

    // Track active connections
    pool.on("acquire", () => {
      activeConnections++;
    });

    pool.on("release", () => {
      activeConnections--;
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

  if (!pool) {
    throw new Error("Database pool is not initialized");
  }

  const connection = await pool.getConnection();
  try {
    const start = performance.now();
    const [results] = await connection.execute(sql, params);
    const duration = performance.now() - start;

    // Log query performance
    console.log(`Query executed in ${duration.toFixed(2)} ms`);
    if (duration > slowQueryThreshold) {
      console.warn(
        `Slow query detected: ${sql}, duration: ${duration.toFixed(2)} ms`
      );
    }

    return results;
  } catch (error) {
    console.error("Database error:", error);
    throw error; // Rethrow the error after logging it
  } finally {
    connection.release(); // Release the connection back to the pool
  }
}
