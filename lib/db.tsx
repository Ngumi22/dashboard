import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export async function initDbConnection(): Promise<void> {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
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
    const [results] = await connection.execute(sql, params);
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
