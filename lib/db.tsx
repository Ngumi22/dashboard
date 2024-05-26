import mysql from "mysql2/promise";

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
