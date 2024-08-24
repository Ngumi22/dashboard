"use server";

import { signUp } from "@/lib/actions";
import { fetchUserByEmail, fetchUsers } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { FormState } from "@/lib/definitions";

// Updated to use `NextRequest` and extract `FormState` and `FormData` from it
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData(); // Extract FormData from NextRequest

    const state: FormState = {
      errors: {},
      success: false,
      message: "",
    };

    const result = await signUp(state, formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error during sign-up:", error);
    return NextResponse.json(
      { error: "Failed to sign up user." },
      { status: 500 }
    );
  }
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
