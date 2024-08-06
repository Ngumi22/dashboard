import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./sessions";
import { getUserById } from "./data";

const allowedIPs = (process.env.ALLOWED_IPS || "").split(",");

export function checkIP(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.ip || "";
  if (!allowedIPs.includes(clientIP)) {
    return NextResponse.redirect("/login");
  }
  return NextResponse.next();
}

export async function authMiddleware(req: NextRequest) {
  const session = await verifySession();

  if (!session) {
    return NextResponse.redirect("/login");
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.redirect("/login");
  }

  (req as any).user = user;
  return NextResponse.next();
}
