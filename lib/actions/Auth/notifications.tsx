"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function fetchNotifications() {
  const cacheKey = "notifications";

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [notifications] = await connection.query<RowDataPacket[]>(
      `SELECT notification_id, user_id, message, status, created_at FROM notifications ORDER BY notification_id DESC`
    );

    if (notifications.length === 0) {
      return null;
    }

    const formattedNotifications = notifications.map((notification) => ({
      notification_id: notification.notification_id,
      user_id: notification.user_id,
      message: notification.message,
      status: notification.status,
      created_at: notification.created_at,
    }));

    cache.set(cacheKey, {
      value: formattedNotifications,
      expiry: Date.now() + 36 * 10,
    });

    return formattedNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateNotification(
  notificationId: number,
  updatedData: { status?: string }
) {
  const connection = await getConnection();
  try {
    const updateFields = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.values(updatedData);

    await connection.query<ResultSetHeader>(
      `UPDATE notifications SET ${updateFields} WHERE notification_id = ?`,
      [...updateValues, notificationId]
    );

    return { notification_id: notificationId, ...updatedData };
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteNotification(notificationId: number) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `DELETE FROM notifications WHERE notification_id = ?`,
      [notificationId]
    );

    return { success: true, notification_id: notificationId };
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  } finally {
    connection.release();
  }
}
