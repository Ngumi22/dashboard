import mysql from "mysql2/promise";
let pool: mysql.Pool;

export async function query(sql: any, params: any) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    namedPlaceholders: true,
  });

  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database error:", error);
    await connection.rollback();
  } finally {
    await connection.end();
  }
}

export async function initDbConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: 3306,
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
}

export async function getConnection() {
  if (!pool) await initDbConnection();
  return pool.getConnection();
}
