"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function fetchActionLogs() {
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
    const [action_logs] = await connection.query<RowDataPacket[]>(
      `SELECT log_id, user_id, action_id, entity_id, target_id FROM actions_logs ORDER BY log_id DESC`
    );

    if (action_logs.length === 0) {
      return null;
    }

    const formattedActionLogs = action_logs.map((action_log) => ({
      log_id: action_log.log_id,
      user_id: action_log.user_id,
      action_id: action_log.action_id,
      entity_id: action_log.entity_id,
      target_id: action_log.target_id,
    }));

    cache.set(cacheKey, {
      value: formattedActionLogs,
      expiry: Date.now() + 36 * 10,
    });

    return formattedActionLogs;
  } catch (error) {
    console.error("Error fetching action_log:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteActionLog(action_logId: number) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `DELETE FROM action_logs WHERE log_id = ?`,
      [action_logId]
    );

    return { success: true, log_id: action_logId };
  } catch (error) {
    console.error("Error deleting action-log:", error);
    throw error;
  } finally {
    connection.release();
  }
}
