"use server";

import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader } from "mysql2/promise";

export async function deleteUser(userId: number) {
  const connection = await getConnection();
  try {
    // Delete the user from the database
    await connection.query<ResultSetHeader>(
      `DELETE FROM users WHERE user_id = ?`,
      [userId]
    );

    return { success: true, user_id: userId };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  } finally {
    connection.release();
  }
}
