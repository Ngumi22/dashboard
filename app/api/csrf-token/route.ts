import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { initialize } from "@/lib/MysqlDB/initialize";

export async function GET() {
  await initialize();
  const token = crypto.randomBytes(32).toString("hex");

  cookies().set("XSRF-TOKEN", token, {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Prevents CSRF attacks from other sites
    path: "/",
  });

  return NextResponse.json({ csrfToken: token });
}
