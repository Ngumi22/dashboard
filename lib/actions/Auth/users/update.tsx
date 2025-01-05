"use server";

import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader } from "mysql2/promise";

interface UserData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  image: string;
  password_hash: string;
  is_verified: boolean;
  blocked_by: string[];
}

export async function updateUser(
  userId: number,
  updatedData: Partial<UserData>
) {
  const connection = await getConnection();
  try {
    const updateFields = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.values(updatedData);

    if (updatedData.blocked_by) {
      updateValues[updateValues.indexOf(updatedData.blocked_by)] =
        JSON.stringify(updatedData.blocked_by);
    }

    await connection.query<ResultSetHeader>(
      `UPDATE users SET ${updateFields} WHERE user_id = ?`,
      [...updateValues, userId]
    );

    return { user_id: userId, ...updatedData };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  } finally {
    connection.release();
  }
}
