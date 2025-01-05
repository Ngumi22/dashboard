"use server";

import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface RoleData {
  role_name: string;
}

export async function createRole(roleData: RoleData) {
  const connection = await getConnection();
  try {
    // Check if the role already exists
    const [existingRole] = await connection.query<RowDataPacket[]>(
      "SELECT role_id FROM roles WHERE role_name = ?",
      [roleData.role_name]
    );

    if (existingRole.length > 0) {
      return {
        success: true,
        message: "Role already exists",
        roleId: existingRole[0].role_id,
      };
    }
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO roles (role_name) VALUES (?)`,
      [roleData.role_name]
    );

    return { role_id: result.insertId, role_name: roleData.role_name };
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateRole(roleId: number, updatedData: RoleData) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `UPDATE roles SET role_name = ? WHERE role_id = ?`,
      [updatedData.role_name, roleId]
    );

    return { role_id: roleId, role_name: updatedData.role_name };
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  } finally {
    connection.release();
  }
}
