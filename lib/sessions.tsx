import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";

export type SessionPayload = {
  userId: string | number;
  expiresAt: Date;
};

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

// Encrypt payload with an expiration
export async function encrypt(payload: SessionPayload, expiresIn: string) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

// Decrypt the token
export async function decrypt(token: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

// Create session token
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12-hour expiration
  const sessionToken = await encrypt({ userId, expiresAt }, "12hr");

  cookies().set("session", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return sessionToken;
}

// Verify session
export async function verifySession() {
  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);

  if (!session || !session.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: Number(session.userId) };
}

// Create a verification token
export async function createVerificationToken(userId: string) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2-hour expiration
  return encrypt({ userId, expiresAt }, "2h");
}

export function deleteSession() {
  cookies().delete("session");
  redirect("/login");
}
