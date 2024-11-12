import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { decrypt } from "@/lib/sessions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-fail", req.url));
  }

  try {
    const payload = await decrypt(token);
    if (!payload || !payload.userId) {
      return NextResponse.redirect(new URL("/verify-fail", req.url));
    }

    const connection = await getConnection();
    await connection.query("UPDATE users SET is_verified = TRUE WHERE id = ?", [
      payload.userId,
    ]);
    connection.release();

    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/verify-fail", req.url));
  }
}
