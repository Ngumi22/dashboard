import "server only";

import { signUp } from "@/lib/actions";
import { fetchUserByEmail, fetchUsers } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { FormState } from "@/lib/definitions";

export async function POST(state: FormState, formData: FormData) {
  return signUp(state, formData);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const first_name = url.searchParams.get("first_name");
  const last_name = url.searchParams.get("last_name");
  const email = url.searchParams.get("email");
  const role = url.searchParams.get("role");

  const params = {
    first_name,
    last_name,
    email,
    role,
  };

  if (!params) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    let users;
    if (email) {
      users = await fetchUserByEmail(email);
    } else {
      users = await fetchUsers();
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}
