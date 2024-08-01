import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "../../../lib/db"; // Adjust path as needed
import { decrypt } from "@/lib/sessions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  try {
    const session = await decrypt(token);
    if (!session || !session.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const connection = await getConnection();
    await connection.query(`UPDATE users SET is_verified = TRUE WHERE id = ?`, [
      session.userId,
    ]);
    connection.release();

    return NextResponse.json(
      { message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Failed to verify email." },
      { status: 500 }
    );
  }
}
