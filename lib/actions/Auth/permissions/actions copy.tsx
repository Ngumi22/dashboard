"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function fetchActions() {
  const cacheKey = "actions";

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [actions] = await connection.query<RowDataPacket[]>(
      `SELECT action_id, action_name FROM actions ORDER BY action_id DESC`
    );

    if (actions.length === 0) {
      return null;
    }

    const formattedAction = actions.map((action) => ({
      action_id: action.action_id,
      action_name: action.action_name,
    }));

    cache.set(cacheKey, {
      value: formattedAction,
      expiry: Date.now() + 36 * 10,
    });

    return formattedAction;
  } catch (error) {
    console.error("Error fetching action:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function createAction(formData: FormData) {
  const actionName = formData.get("action_name") as string;
  const connection = await getConnection();
  try {
    // Check if the category already exists
    const [existingAction] = await connection.query<RowDataPacket[]>(
      "SELECT action_id FROM actions WHERE action_name = ?",
      [actionName]
    );

    if (existingAction.length > 0) {
      return {
        success: true,
        message: "Action already exists",
        productId: existingAction[0].action_id,
      };
    }
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO actions (action_name) VALUES (?)`,
      [actionName]
    );

    return {
      success: true,
      action: { action_id: result.insertId, action_name: actionName },
    };
  } catch (error) {
    console.error("Error creating action:", error);
    return { success: false, error: "Failed to create action" };
  } finally {
    connection.release();
  }
}

export async function updateAction(formData: FormData) {
  const actionId = formData.get("action_id") as string;
  const actionName = formData.get("action_name") as string;
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `UPDATE actions SET action_name = ? WHERE action_id = ?`,
      [actionName, actionId]
    );

    return {
      success: true,
      action: { action_id: parseInt(actionId), action_name: actionName },
    };
  } catch (error) {
    console.error("Error updating action:", error);
    return { success: false, error: "Failed to update action" };
  } finally {
    connection.release();
  }
}

export async function deleteActionLog(actionId: number) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `DELETE FROM actions WHERE action_id = ?`,
      [actionId]
    );

    return { success: true, action_id: actionId };
  } catch (error) {
    console.error("Error deleting action-log:", error);
    throw error;
  } finally {
    connection.release();
  }
}
