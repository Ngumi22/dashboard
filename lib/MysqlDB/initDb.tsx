import mysql from "mysql2/promise";
import { performance } from "perf_hooks";

// This module initializes the database pool and provides utility functions for querying the database.

let slowQueryThreshold = 1000; // in ms, adjust as needed

let pool: mysql.Pool | null = null;
let activeConnections = 0;
let totalConnectionsCreated = 0;

export async function initDbConnection(): Promise<void> {
  if (!pool) {
    pool = mysql.createPool({
      host: "127.0.0.1",
      user: "root",
      password: "123456",
      database: "bernzzz",
      waitForConnections: true,
      connectionLimit: 100000,
      queueLimit: 0,
    });

    // Check if pool and config are accessible
    if (pool && pool.pool && pool.pool.config) {
      console.log("Database pool initialized successfully.");
    } else {
      console.error("Error: Pool initialized, but config is not accessible.");
    }

    // Track total connections created
    pool.on("connection", () => {
      totalConnectionsCreated++;
      // console.log(`Total connections created: ${totalConnectionsCreated}`);
    });

    // Track active connections
    pool.on("acquire", () => {
      activeConnections++;
      // console.log(`Active connections: ${activeConnections}`);
    });

    pool.on("release", () => {
      activeConnections--;
      // console.log(`Active connections: ${activeConnections}`);
    });
  } else {
    console.log("Database pool is already initialized.");
  }
}

export function getConnectionPoolMetrics() {
  if (!pool || !pool.pool || !pool.pool.config) {
    console.error(
      "Error: Database pool is not initialized or config is inaccessible"
    );
    return {
      error: "Database pool is not initialized or config is inaccessible",
    };
  }

  // console.log("Fetching connection pool metrics...");

  return {
    activeConnections,
    totalConnectionsCreated,
    connectionLimit: pool.pool.config.connectionLimit, // Access the correct config
  };
}

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
    throw error; // rethrow the error after logging it
  } finally {
    connection.release(); // Release the connection back to the pool
  }
}

export async function getConnection(): Promise<mysql.PoolConnection> {
  if (!pool) {
    await initDbConnection();
  }

  if (!pool) {
    throw new Error("Database pool is not initialized");
  }

  return pool.getConnection();
}
