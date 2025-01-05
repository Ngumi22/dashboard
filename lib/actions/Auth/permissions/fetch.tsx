"use server";

import { cache } from "@/lib/cache"; // Cache utility
import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";

export async function hasPermissions() {
  const cacheKey = "permissions";

  // Check cache for existing data
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if valid
    }
    cache.delete(cacheKey); // Remove expired cache
  }

  const connection = await getConnection();
  try {
    // Query to fetch user permissions and related data
    const [permissions] = await connection.query<RowDataPacket[]>(`
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
    `);

    if (permissions.length === 0) {
      return null; // No permissions found
    }

    // Map results to a structured format
    const formattedPermissions = permissions.map((permission) => ({
      user_name: permission.user_name,
      role: permission.user_role, // Fixed field name
      entity: permission.entity_name,
      action: permission.action_name,
      has_permission: permission.has_permission === 1 ? "Yes" : "No", // Explicitly convert to TRUE/FALSE
    }));

    // Cache the result for future requests
    cache.set(cacheKey, {
      value: formattedPermissions,
      expiry: Date.now() + 60 * 60 * 10, // 1 hour cache (fixed)
    });

    return formattedPermissions;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  } finally {
    connection.release(); // Ensure database connection is released
  }
}
