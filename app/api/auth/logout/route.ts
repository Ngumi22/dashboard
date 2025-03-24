import { destroySession } from "@/lib/Auth_actions/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  await destroySession();
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL)
  );
}
