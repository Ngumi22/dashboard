import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function authmiddleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || "";
  const url = request.nextUrl.clone();

  // Define protected routes
  const protectedRoutes = ["/dashboard"];

  if (protectedRoutes.some((route) => url.pathname.startsWith(route))) {
    if (!token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      request.headers.set("user", JSON.stringify(decoded));
    } catch (error) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.append("Access-Control-Allow-Origin", "http://localhost:3001");
  res.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.headers.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return res;
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
