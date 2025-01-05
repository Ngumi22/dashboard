"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function fetchSessions() {
  const cacheKey = "sessions";

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [sessions] = await connection.query<RowDataPacket[]>(
      `SELECT session_id, user_id, created_at, expires_at FROM sessions ORDER BY session_id DESC`
    );

    if (sessions.length === 0) {
      return null;
    }

    const formattedSessions = sessions.map((session) => ({
      session_id: session.session_id,
      user_id: session.user_id,
      created_at: session.created_at,
      expires_at: session.expires_at,
    }));

    cache.set(cacheKey, {
      value: formattedSessions,
      expiry: Date.now() + 36 * 10,
    });

    return formattedSessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateSession(
  sessionId: number,
  updatedData: { expires_at?: Date }
) {
  const connection = await getConnection();
  try {
    const updateFields = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.values(updatedData);

    await connection.query<ResultSetHeader>(
      `UPDATE sessions SET ${updateFields} WHERE session_id = ?`,
      [...updateValues, sessionId]
    );

    return { session_id: sessionId, ...updatedData };
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteSession(sessionId: number) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `DELETE FROM sessions WHERE session_id = ?`,
      [sessionId]
    );

    return { success: true, session_id: sessionId };
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  } finally {
    connection.release();
  }
}
