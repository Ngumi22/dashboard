import { cookies, headers } from "next/headers";
import * as jose from "jose";
import { nanoid } from "nanoid";
import {
  getUserById,
  storeRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
} from "./db";

// Define session data structure
export type SessionData = {
  userId: number;
  role: string;
  name: string;
  email: string;
};

// JWT configuration
const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET
);

// Token expiration times
const ACCESS_TOKEN_EXPIRATION = "120m";
const REFRESH_TOKEN_EXPIRATION = "7d";
const REFRESH_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** ================== Cookie Helper Functions ================== */
function setCookie(
  name: string,
  value: string,
  options: { maxAge: number; path?: string }
) {
  cookies().set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: options.path || "/",
    maxAge: options.maxAge,
  });
}

function getCookie(name: string) {
  return cookies().get(name)?.value || null;
}

function deleteCookie(name: string) {
  cookies().delete(name);
}

/** ================== Create a new session ================== */
export async function createSession(data: SessionData) {
  try {
    const jti = nanoid();

    // Create access token (small payload)
    const accessToken = await new jose.SignJWT({
      userId: data.userId,
      role: data.role,
      name: data.name,
      email: data.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
      .setJti(jti)
      .setAudience("api:access")
      .sign(JWT_ACCESS_SECRET);

    // Create refresh token (one-time use)
    const refreshTokenId = nanoid();
    const refreshToken = await new jose.SignJWT({ userId: data.userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
      .setJti(refreshTokenId)
      .setAudience("api:refresh")
      .sign(JWT_REFRESH_SECRET);

    // Store refresh token metadata
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
    await storeRefreshToken({
      id: refreshTokenId,
      userId: data.userId,
      token: refreshToken,
      expiresAt,
      userAgent: headers().get("user-agent") || "",
      ip: headers().get("x-forwarded-for") || headers().get("x-real-ip") || "",
    });

    // Set cookies using helper functions
    setCookie("access_token", accessToken, { maxAge: 15 * 60 });
    setCookie("refresh_token", refreshToken, {
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

/** ================== Verify access token ================== */
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_ACCESS_SECRET, {
      audience: "api:access",
      clockTolerance: 15,
    });
    return {
      userId: payload.userId as number,
      role: payload.role as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch (error) {
    return null;
  }
}

/** ================== Verify refresh token ================== */
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_REFRESH_SECRET, {
      audience: "api:refresh",
      clockTolerance: 15,
    });

    // Ensure the refresh token is valid in the database
    const isValid = await isRefreshTokenValid(payload.jti as string);
    if (!isValid) return null;

    return { userId: payload.userId as number, jti: payload.jti as string };
  } catch (error) {
    return null;
  }
}

/** ================== Get the current session from cookies ================== */
export async function getSession() {
  const accessToken = getCookie("access_token");
  if (!accessToken) return null;

  return verifyAccessToken(accessToken);
}

/** ================== Refresh the session using a refresh token ================== */
/** ================== Refresh the session using a refresh token ================== */
export async function refreshSession() {
  const refreshToken = getCookie("refresh_token");
  if (!refreshToken) return null;

  const tokenData = await verifyRefreshToken(refreshToken);
  if (!tokenData) return null;

  const user = await getUserById(tokenData.userId);
  if (!user) return null;

  // Revoke the old refresh token
  await revokeRefreshToken(tokenData.jti);

  // Create new session (extending user session)
  return createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
}

/** ================== Destroy the current session ================== */
export async function destroySession() {
  const refreshToken = getCookie("refresh_token");

  if (refreshToken) {
    try {
      const tokenData = await verifyRefreshToken(refreshToken);
      if (tokenData?.jti) await revokeRefreshToken(tokenData.jti);
    } catch (error) {
      // Token might be invalid, just proceed with cleanup
    }
  }

  // Clear cookies using helper function
  deleteCookie("access_token");
  deleteCookie("refresh_token");
}
