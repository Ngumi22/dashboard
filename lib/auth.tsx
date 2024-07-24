import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "8r3oRjdWyFYzX8Q6EPuIxotYVc1G983nT+uRT12XRVE=";

interface AuthenticatedUser extends JwtPayload {
  id: string;
  role: string;
}

export async function authenticate(
  request: NextRequest
): Promise<AuthenticatedUser | NextResponse<{ error: string }>> {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function authorize(
  request: NextRequest,
  roles: string[]
): Promise<AuthenticatedUser | NextResponse<{ error: string }>> {
  const user = await authenticate(request);

  if (user instanceof NextResponse) {
    return user;
  }

  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return user;
}
