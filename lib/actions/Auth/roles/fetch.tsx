"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";

// Function to fetch roles with cache logic
export async function fetchRoles() {
  const cacheKey = "roles";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return {
        success: true,
        message: "Roles fetched successfully from cache.",
        data: cachedData.value,
      };
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch all roles from the database
    const [roles] = await connection.query<RowDataPacket[]>(
      `SELECT role_id, role_name, created_at, updated_at FROM roles ORDER BY role_id DESC`
    );

    // Handle the case when no roles are found
    if (roles.length === 0) {
      return {
        success: false,
        message: "No roles found in the database.",
        data: null,
      };
    }

    // Format the roles data
    const formattedRoles = roles.map((role) => ({
      role_id: role.role_id,
      role_name: role.role_name,
      created_at: role.created_at,
      updated_at: role.updated_at,
    }));

    // Cache the result with an expiry time (1 hour)
    cache.set(cacheKey, {
      value: formattedRoles,
      expiry: Date.now() + 3600000, // Cache expires in 1 hour
    });

    return {
      success: true,
      message: "Roles fetched successfully.",
      data: formattedRoles,
    };
  } catch (error) {
    console.error("Error fetching roles:", error);

    // Return a failure response
    return {
      success: false,
      message:
        "An error occurred while fetching roles. Please try again later.",
      data: null,
    };
  } finally {
    connection.release();
  }
}
