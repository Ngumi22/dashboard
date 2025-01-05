"use server";

import { revalidatePath } from "next/cache";
import { getConnection } from "@/lib/MysqlDB/initDb";

export async function createPermission(formData: FormData) {
  const userId = formData.get("userId") as string;
  const entityId = formData.get("entityId") as string;
  const actionId = formData.get("actionId") as string;
  const hasPermission = formData.get("hasPermission") === "on";

  try {
    const connection = await getConnection();

    await connection.execute(
      "INSERT INTO permissions (user_id, entity_id, action_id, has_permission) VALUES (?, ?, ?, ?)",
      [userId, entityId, actionId, hasPermission]
    );
    connection.release();
    revalidatePath("/permissions");
    return { success: true };
  } catch (error) {
    console.error("Failed to create permission:", error);
    return { success: false, error: "Failed to create permission" };
  }
}

export async function updatePermission(formData: FormData) {
  const permissionId = formData.get("permissionId") as string;
  const userId = formData.get("userId") as string;
  const entityId = formData.get("entityId") as string;
  const actionId = formData.get("actionId") as string;
  const hasPermission = formData.get("hasPermission") === "on";

  try {
    const connection = await getConnection();
    await connection.execute(
      "UPDATE permissions SET user_id = ?, entity_id = ?, action_id = ?, has_permission = ? WHERE permission_id = ?",
      [userId, entityId, actionId, hasPermission, permissionId]
    );
    connection.release();
    revalidatePath("/permissions");
    return { success: true };
  } catch (error) {
    console.error("Failed to update permission:", error);
    return { success: false, error: "Failed to update permission" };
  }
}

export async function deletePermission(formData: FormData) {
  const permissionId = formData.get("permissionId") as string;

  try {
    const connection = await getConnection();
    await connection.execute(
      "DELETE FROM permissions WHERE permission_id = ?",
      [permissionId]
    );
    connection.release();
    revalidatePath("/permissions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete permission:", error);
    return { success: false, error: "Failed to delete permission" };
  }
}
