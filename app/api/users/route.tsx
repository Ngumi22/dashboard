import { signUp } from "@/lib/actions";
import { fetchUsers } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(formData: FormData) {
  return signUp(formData);
}

export async function GET() {
  try {
    const users = await fetchUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
