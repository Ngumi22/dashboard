import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./sessions";
import { getUserById } from "./data";

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
