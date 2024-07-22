import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Ngumi95"; // Ensure to use a secure key in production

// Generate JWT
export function generateToken(userId: number, role: string) {
  const payload = { userId, role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Verify JWT
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
