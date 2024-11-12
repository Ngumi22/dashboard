import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db"; // Adjust path as needed
import { decrypt } from "@/lib/sessions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    console.error("Token not provided in request");
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  try {
    console.log("Decrypting token...");
    const session = await decrypt(token);
    if (!session || !session.userId) {
      console.error("Token decryption failed or userId missing", session);
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    console.log("Establishing database connection...");
    const connection = await getConnection();

    console.log(
      "Updating user verification status for userId:",
      session.userId
    );
    await connection.query(`UPDATE users SET is_verified = TRUE WHERE id = ?`, [
      session.userId,
    ]);
    connection.release();

    console.log("Redirecting after successful verification");
    return NextResponse.redirect(new URL(`/verify?token=${token}`, req.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Failed to verify email." },
      { status: 500 }
    );
  }
}
