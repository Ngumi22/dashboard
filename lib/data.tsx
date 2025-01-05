import { getConnection } from "./db";
import { mapUserRow } from "./utils";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { UserRow, User } from "./definitions";

export async function fetchUsers(): Promise<User[]> {
  const connection = await getConnection();

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM users`
    );

    // Map each row to a User object
    const users = (rows as UserRow[]).map(mapUserRow);

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchUserByEmail(email: string): Promise<UserRow[]> {
  const connection = await getConnection();

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, first_name, last_name, email, password FROM users WHERE email = ?`,
      [email]
    );
    return rows as UserRow[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } finally {
    connection.release();
  }
}
export async function getUserById(userId: any) {
  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Error fetching user by Id:", error);
    throw error;
  } finally {
    connection.release();
  }
}
