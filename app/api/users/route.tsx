import { NextRequest, NextResponse } from "next/server";
import { handleCreateUser } from "@/lib/actions";
import { fetchUsers } from "@/lib/data";

export async function GET() {
  try {
    const { success, users, message } = await fetchUsers();

    if (!success) {
      return NextResponse.json({ success: false, message }, { status: 500 });
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return await handleCreateUser(request);
}
