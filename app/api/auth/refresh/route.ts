import { refreshSession } from "@/lib/Auth_actions/sessions";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Attempt to refresh the session
    const result = await refreshSession();

    if (!result) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Token refresh error:", error);

    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
