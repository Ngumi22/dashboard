import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { decrypt } from "@/lib/sessions";

// Define a custom type that includes affectedRows
type QueryResultWithAffectedRows = {
  affectedRows: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    console.error("Verification failed: No token provided");
    return NextResponse.redirect(new URL("/verify-fail", req.url));
  }

  try {
    const payload = await decrypt(token);
    if (!payload || !payload.userId) {
      console.error("Verification failed: Invalid token payload", payload);
      return NextResponse.redirect(new URL("/verify-fail", req.url));
    }

    console.log("Decrypted payload:", payload);

    const connection = await getConnection();
    console.log("Database connection established");

    // Perform the update query and destructure the result tuple
    const [result] = (await connection.query(
      "UPDATE users SET is_verified = TRUE WHERE id = ?",
      [payload.userId]
    )) as [QueryResultWithAffectedRows, any];

    // Check affectedRows to confirm the update
    if (result.affectedRows === 0) {
      console.error("Verification failed: User not found or already verified");
      return NextResponse.redirect(new URL("/verify-fail", req.url));
    }

    connection.release();
    console.log("User verification successful, redirecting to login");

    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/verify-fail", req.url));
  }
}
