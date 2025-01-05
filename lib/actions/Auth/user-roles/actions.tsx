"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

// Function to fetch roles with cache logic
export async function fetchRoles() {
  const cacheKey = "roles";

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
    // Fetch all roles
    const [roles] = await connection.query<RowDataPacket[]>(
      `SELECT role_id, role_name, created_at, updated_at FROM roles ORDER BY role_id DESC`
    );

    if (roles.length === 0) {
      return null; // Return null if no roles exist
    }

    // Map the result to the desired format
    const formattedRoles = roles.map((role) => ({
      role_id: role.role_id,
      role_name: role.role_name,
      created_at: role.created_at,
      updated_at: role.updated_at,
    }));

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: formattedRoles,
      expiry: Date.now() + 36 * 10, // Cache expires in 1 hour
    });

    return formattedRoles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchUserRoles() {
  const cacheKey = "user_roles";

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [userRoles] = await connection.query<RowDataPacket[]>(
      `SELECT user_role_id, user_id, role_id FROM user_roles ORDER BY user_role_id DESC`
    );

    if (userRoles.length === 0) {
      return null;
    }

    const formattedUserRoles = userRoles.map((userRole) => ({
      user_role_id: userRole.user_role_id,
      user_id: userRole.user_id,
      role_id: userRole.role_id,
    }));

    cache.set(cacheKey, {
      value: formattedUserRoles,
      expiry: Date.now() + 36 * 10,
    });

    return formattedUserRoles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateUserRole(
  userRoleId: number,
  updatedData: { role_id?: number }
) {
  const connection = await getConnection();
  try {
    const updateFields = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.values(updatedData);

    await connection.query<ResultSetHeader>(
      `UPDATE user_roles SET ${updateFields} WHERE user_role_id = ?`,
      [...updateValues, userRoleId]
    );

    return { user_role_id: userRoleId, ...updatedData };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteUserRole(userRoleId: number) {
  const connection = await getConnection();
  try {
    await connection.query<ResultSetHeader>(
      `DELETE FROM user_roles WHERE user_role_id = ?`,
      [userRoleId]
    );

    return { success: true, user_role_id: userRoleId };
  } catch (error) {
    console.error("Error deleting user role:", error);
    throw error;
  } finally {
    connection.release();
  }
}
