import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "@/lib/db";

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  const { email, password } = await request.json();

  try {
    const [users]: [any[], any] = await connection.query(
      "SELECT id, username, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
