import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/sessions";

// 1. Specify protected and public routes
const protectedRoutes = ["/", "/dashboard", "/dashboard/:path*"];
const publicRoutes = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );

  // 3. Decrypt the session from the cookie
  const cookie = cookies().get("session")?.value;
  let session;

  try {
    session = await decrypt(cookie); // Ensure decrypt handles errors gracefully
  } catch (error) {
    console.error("Error decrypting session:", error); // Log errors for debugging
    return NextResponse.redirect(new URL("/login", req.nextUrl)); // Redirect on decryption failure
  }

  // 4. Redirect
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl)); // Redirect to login if not authenticated
  }

  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl)); // Redirect to dashboard if authenticated and accessing public routes
  }

  return NextResponse.next(); // Continue to requested path if no redirection is needed
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
