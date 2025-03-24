// This file contains authentication-related utilities

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAllowedEmails } from "./db";
import { getSession } from "./sessions";

// List of allowed email domains or specific emails
const ALLOWED_EMAIL_DOMAINS = JSON.parse(process.env.ALLOWED_DOMAINS || "[]");
const ALLOWED_SPECIFIC_EMAILS = JSON.parse(process.env.ALLOWED_EMAILS || "[]");

// Function to check if an email is allowed to register
export async function isAllowedEmail(email: string): Promise<boolean> {
  // Check if the email is in the specific allowlist
  if (ALLOWED_SPECIFIC_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // Check if the email domain is in the allowed domains list
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }

  // Check database for allowed emails
  try {
    const allowedEmails = await getAllowedEmails();
    if (allowedEmails.includes(email.toLowerCase())) {
      return true;
    }
  } catch (error) {
    console.error("Error checking allowed emails from database:", error);
  }

  // If none of the conditions are met, the email is not allowed
  return false;
}

// Hash password before storing in database
export async function hashPassword(password: string): Promise<string> {
  // Use a high cost factor (12+) for bcrypt to make brute force attacks more difficult
  return hash(password, 14);
}

// Verify password during login
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}

// Middleware to protect routes
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

// Middleware to require specific role
export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return session;
}

// Validate CSRF token
export function validateCsrfToken(token: string): boolean {
  const storedToken = cookies().get("XSRF-TOKEN")?.value;

  if (!storedToken || !token) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(token, storedToken);
}

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
