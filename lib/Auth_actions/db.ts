"use server";

import { dbOperation } from "../MysqlDB/dbOperations";

// Interface for user data
interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Interface for refresh token data
interface RefreshTokenData {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  userAgent: string;
  ip: string;
}

// Create a new user in the database
export async function createUser(userData: UserData) {
  const { name, email, password, role } = userData;

  try {
    return await dbOperation(async (connection) => {
      // Insert the user into the database
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password, role, created_at)
            VALUES (?, ?, ?, ?, NOW())`,
        [name, email, password, role]
      );

      return result;
    });
  } catch (error) {}
}

// Get a user by email
export async function getUserByEmail(email: string) {
  try {
    return await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      return rows[0] || null;
    });
  } catch (error) {}
}

// Get a user by ID
export async function getUserById(id: number) {
  try {
    return await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      return rows[0] || null;
    });
  } catch (error) {}
}

// Get allowed emails from the database
export async function getAllowedEmails() {
  try {
    return await dbOperation(async (connection) => {
      const [rows] = await connection.query("SELECT email FROM allowed_emails");

      return rows.map((row: any) => row.email);
    });
  } catch (error) {}
}

// Store a refresh token in the database
export async function storeRefreshToken(tokenData: RefreshTokenData) {
  try {
    return await dbOperation(async (connection) => {
      const { id, userId, token, expiresAt, userAgent, ip } = tokenData;

      await connection.query(
        `INSERT INTO refresh_tokens (id, user_id, token, expires_at, user_agent, ip, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, userId, token, expiresAt, userAgent, ip]
      );
    });
  } catch (error) {}
}

// Check if a refresh token is valid (not revoked)
export async function isRefreshTokenValid(tokenId: string) {
  try {
    return await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        "SELECT * FROM refresh_tokens WHERE id = ? AND revoked = 0 AND expires_at > NOW()",
        [tokenId]
      );

      return rows.length > 0;
    });
  } catch (error) {}
}

// Revoke a refresh token
export async function revokeRefreshToken(tokenId: string) {
  return await dbOperation(async (connection) => {
    await connection.query(
      "UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE id = ?",
      [tokenId]
    );
  });
}

// Revoke all refresh tokens for a user
export async function revokeAllUserTokens(userId: number) {
  return await dbOperation(async (connection) => {
    await connection.query(
      "UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE user_id = ? AND revoked = 0",
      [userId]
    );
  });
}

// Log authentication attempts (for security auditing)
export async function logAuthAttempt({
  email,
  success,
  ip,
  userAgent,
  reason = null,
}: {
  email: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  reason?: string | null;
}) {
  return await dbOperation(async (connection) => {
    await connection.query(
      `INSERT INTO auth_logs (email, success, ip, user_agent, reason, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
      [email, success ? 1 : 0, ip, userAgent, reason]
    );
  });
}
