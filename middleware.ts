import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "./lib/sessions";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard", "/dashboard/:path*"];
const publicRoutes = ["/login", "/signUp"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res;
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );

  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
