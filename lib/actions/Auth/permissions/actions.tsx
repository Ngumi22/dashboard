"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";

export async function hasPermissions() {
  const cacheKey = "permissions";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch all users with their combined permissions
    const [permissions] = await connection.query<RowDataPacket[]>(
      `
      SELECT
          CONCAT(u.first_name, ' ', u.last_name) AS user_name,
          u.role AS user_role,
          e.entity_name,
          a.action_name,
          p.has_permission
          FROM
              permissions p
          JOIN
              users u ON p.user_id = u.user_id
          JOIN
              entities e ON p.entity_id = e.entity_id
          JOIN
              actions a ON p.action_id = a.action_id
          ORDER BY
      u.role, u.user_id, e.entity_name, a.action_name
      `
    );

    if (permissions.length === 0) {
      return null; // Return null if no permissions exist
    }

    // Map the result to the desired format
    const formattedUsers = permissions.map((permission) => ({
      name: permission.user_name, // Combined name
      email: permission.email,
      phone_number: permission.phone_number,
      is_verified: permission.is_verified,
      blocked_by: permission.blocked_by,
      created_at: permission.user_created_at,
      updated_at: permission.user_updated_at,
      roles: permission.roles,
      session_token: permission.session_token,
      session_expiry: permission.session_expiry,
      actions_taken: permission.actions_taken,
    }));

    // Cache the result with an expiry time (e.g., 1 hour)
    cache.set(cacheKey, {
      value: formattedUsers,
      expiry: Date.now() + 60 * 60 * 1000, // 1 hour in milliseconds
    });

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    throw error;
  } finally {
    connection.release(); // Ensure the connection is released
  }
}
