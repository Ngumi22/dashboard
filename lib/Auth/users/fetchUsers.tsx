"use server";

import { cache } from "@/lib/cache"; // Assuming you have a cache system in place
import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";

// Define the User type
export interface User {
  staff_id: number;
  name: string;
  phone_number: string;
  email: string;
  is_verified: boolean;
  role: "Super-Admin" | "Admin" | "User";
  created_at: string; // Or use Date if necessary
  updated_at: string;
  is_blocked?: boolean; // Derived field
  password_hash?: string; // Optional if this data is required
}

export async function fetchUsers() {
  const cacheKey = "users";

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
    // Fetch all users with combined name
    const [users] = await connection.query<RowDataPacket[]>(
      `SELECT
         staff_id,
         role,
         CONCAT(first_name, ' ', last_name) AS name,
         phone_number,
         email,
         image,
         is_verified,
         created_at,
         updated_at
       FROM staff_accounts
       ORDER BY staff_id DESC`
    );

    if (users.length === 0) {
      return null; // Return null if no users exist
    }

    // Map the result to the desired format
    const formattedUsers = users.map((user) => ({
      staff_id: user.staff_id,
      role: user.role,
      name: user.name, // Combined name
      phone_number: user.phone_number,
      email: user.email,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: formattedUsers,
      expiry: Date.now() + 36 * 10, // Cache expires in 1 hour
    });

    console.log("Users: ", formattedUsers);

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchUserById(staff_id: number) {
  const cacheKey = `user_${staff_id}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch a user by ID with combined name
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT
         staff_id,
         role,
         CONCAT(first_name, ' ', last_name) AS name,
         phone_number,
         email,
         image,
         is_verified,
         created_at,
         updated_at
       FROM staffs
       WHERE staff_id = ?`,
      [staff_id]
    );

    if (rows.length === 0) {
      return null; // Return null if no users exist
    }

    // Map the result to the desired format
    const user: User = {
      staff_id: rows[0].staff_id,
      role: rows[0].role,
      name: rows[0].name, // Combined name
      phone_number: rows[0].phone_number,
      email: rows[0].email,
      is_verified: rows[0].is_verified,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
    };

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: user,
      expiry: Date.now() + 36 * 10, // Cache expires in 1 hour
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  } finally {
    connection.release();
  }
}

async function fetchUsersQuery(query: string, params: any[] = []) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

export async function fetchUsersWithRoles(limit = 20, offset = 0) {
  const cacheKey = `users_${limit}_${offset}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const query = `
    SELECT
        s.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) AS name,
        s.email,
        s.phone_number,
        s.is_verified,
        s.created_at AS staff_created_at,
        s.role,
    FROM staffs
    LEFT JOIN (
        SELECT s.staff_id, s.session_token, s.expires_at AS session_expiry
        FROM sessions s
        INNER JOIN (
            SELECT staff_id, MAX(expires_at) AS latest_expiry
            FROM sessions
            GROUP BY staff_id
        ) latest ON s.staff_id = latest.staff_id AND s.expires_at = latest.latest_expiry
    ) latest_session ON u.staff_id = latest_session.staff_id
    LEFT JOIN (
        SELECT ae.staff_id AS action_staff_id,
               GROUP_CONCAT(DISTINCT CONCAT(ae.action_name, ' on ', ae.entity_name) ORDER BY ae.action_name, ae.entity_name SEPARATOR '; ') AS actions_taken
        FROM (
            SELECT u.staff_id, a.action_name, e.entity_name
            FROM actions a
            JOIN entities e ON a.action_id = e.entity_id
            JOIN users u ON u.staff_id = u.staff_id
        ) ae
        GROUP BY ae.staff_id
    ) actions ON u.staff_id = actions.action_staff_id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?;
  `;

  const users = await fetchUsersQuery(query, [limit, offset]);
  cache.set(cacheKey, { value: users, expiry: Date.now() + 3600 }); // 1-hour cache
  return users;
}

export async function fetchUserWithRolesById(staff_id: number) {
  const cacheKey = `user_${staff_id}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const query = `
    SELECT
        u.staff_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        u.phone_number,
        u.is_verified,
        u.created_at AS user_created_at,
        u.role,
        latest_session.session_token,
        latest_session.session_expiry,
        actions.actions_taken
    FROM users u
    LEFT JOIN (
        SELECT s.staff_id, s.session_token, s.expires_at AS session_expiry
        FROM sessions s
        INNER JOIN (
            SELECT staff_id, MAX(expires_at) AS latest_expiry
            FROM sessions
            GROUP BY staff_id
        ) latest ON s.staff_id = latest.staff_id AND s.expires_at = latest.latest_expiry
    ) latest_session ON u.staff_id = latest_session.staff_id
    LEFT JOIN (
        SELECT ae.staff_id AS action_staff_id,
               GROUP_CONCAT(DISTINCT CONCAT(ae.action_name, ' on ', ae.entity_name) ORDER BY ae.action_name, ae.entity_name SEPARATOR '; ') AS actions_taken
        FROM (
            SELECT u.staff_id, a.action_name, e.entity_name
            FROM actions a
            JOIN entities e ON a.action_id = e.entity_id
            JOIN users u ON u.staff_id = u.staff_id
        ) ae
        GROUP BY ae.staff_id
    ) actions ON u.staff_id = actions.action_staff_id
    WHERE u.staff_id = ?;
  `;

  const [user] = await fetchUsersQuery(query, [staff_id]);
  cache.set(cacheKey, { value: user, expiry: Date.now() + 3600 }); // 1-hour cache
  return user;
}
