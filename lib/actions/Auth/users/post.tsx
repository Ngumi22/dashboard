"use server";

import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface UserData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  image: string;
  password_hash: string;
  is_verified: boolean;
  role: "Super-Admin" | "Admin" | "User";
}

export async function createUser(userData: UserData) {
  const connection = await getConnection();
  try {
    // Check if the role already exists
    const [existingUser] = await connection.query<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email = ?",
      [userData.email]
    );

    if (existingUser.length > 0) {
      return {
        success: true,
        message: "User already exists",
        userId: existingUser[0].role_id,
      };
    }
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO users (first_name, last_name, phone_number, email, password_hash, image, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.first_name,
        userData.last_name,
        userData.phone_number,
        userData.email,
        userData.password_hash,
        userData.image,
        userData.role,
        userData.is_verified,
      ]
    );

    return { user_id: result.insertId };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  } finally {
    connection.release();
  }
}
