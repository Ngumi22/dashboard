import { cookies } from "next/headers";
import * as jose from "jose";
import { nanoid } from "nanoid";
import {
  getUserById,
  storeRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
} from "./db";

// Define the session data structure
export type SessionData = {
  userId: number;
  name: string;
  email: string;
  role: string;
};

// JWT configuration
const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET
);

// Token expiration times
const ACCESS_TOKEN_EXPIRATION = "15m"; // Short-lived access token
const REFRESH_TOKEN_EXPIRATION = "7d"; // Longer-lived refresh token
const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Create a new session with JWT
export async function createSession(data: SessionData) {
  try {
    // Generate a unique JWT ID to prevent replay attacks
    const jti = nanoid();

    // Create access token (short-lived)
    const accessToken = await new jose.SignJWT({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
      .setJti(jti)
      .setNotBefore(0)
      .setSubject(data.userId.toString())
      .setAudience("api:access")
      .sign(JWT_ACCESS_SECRET);

    // Create refresh token (longer-lived)
    const refreshTokenId = nanoid();
    const refreshToken = await new jose.SignJWT({
      userId: data.userId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
      .setJti(refreshTokenId)
      .setSubject(data.userId.toString())
      .setAudience("api:refresh")
      .sign(JWT_REFRESH_SECRET);

    // Store refresh token in database with metadata
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
    await storeRefreshToken({
      id: refreshTokenId,
      userId: data.userId,
      token: refreshToken,
      expiresAt,
      userAgent: headers().get("user-agent") || "",
      ip: headers().get("x-forwarded-for") || headers().get("x-real-ip") || "",
    });

    // Set HTTP-only cookies
    const cookieStore = cookies();

    // Set access token in cookie (HTTP-only, secure, SameSite=Strict)
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes in seconds
    });

    // Set refresh token in cookie (HTTP-only, secure, SameSite=Strict)
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh", // Only sent to refresh endpoint
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // Set a CSRF token for forms (not HTTP-only, so JS can access it)
    const csrfToken = nanoid();
    cookieStore.set("XSRF-TOKEN", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes in seconds
    });

    return { accessToken, refreshToken, csrfToken };
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

// Verify and decode the access token
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_ACCESS_SECRET, {
      audience: "api:access",
      clockTolerance: 15, // 15 seconds of clock skew allowed
    });

    return {
      userId: payload.userId as number,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    return null;
  }
}

// Verify and decode the refresh token
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_REFRESH_SECRET, {
      audience: "api:refresh",
      clockTolerance: 15, // 15 seconds of clock skew allowed
    });

    // Check if token is valid in database (not revoked)
    const isValid = await isRefreshTokenValid(payload.jti as string);
    if (!isValid) {
      return null;
    }

    return {
      userId: payload.userId as number,
      jti: payload.jti as string,
    };
  } catch (error) {
    return null;
  }
}

// Get the current session from cookies
export async function getSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  // Verify the access token
  const session = await verifyAccessToken(accessToken);
  return session;
}

// Refresh the session using a refresh token
export async function refreshSession() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return null;
  }

  // Verify the refresh token
  const tokenData = await verifyRefreshToken(refreshToken);
  if (!tokenData) {
    return null;
  }

  // Get user data from database
  const user = await getUserById(tokenData.userId);
  if (!user) {
    return null;
  }

  // Revoke the old refresh token (one-time use)
  await revokeRefreshToken(tokenData.jti);

  // Create a new session with fresh tokens
  return createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

// Destroy the current session
export async function destroySession() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Revoke the refresh token in the database if it exists
  if (refreshToken) {
    try {
      const tokenData = await verifyRefreshToken(refreshToken);
      if (tokenData?.jti) {
        await revokeRefreshToken(tokenData.jti);
      }
    } catch (error) {
      // Token might be invalid, continue with cookie removal
    }
  }

  // Clear all auth cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("XSRF-TOKEN");
}

// Get CSRF token from cookies
export function getCsrfToken() {
  return cookies().get("XSRF-TOKEN")?.value;
}

// Headers utility function
function headers() {
  // @ts-ignore - Next.js headers() function
  return new Headers(globalThis.headers?.() || {});
}
