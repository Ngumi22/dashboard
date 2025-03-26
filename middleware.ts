import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed origins for CORS
const allowedOrigins = [
  "https://bernzz-front.vercel.app",
  "https://www.bernzzdigitalsolutions.co.ke",
  "https://dashboard-five-wheat.vercel.app",
  "http://localhost:3000",
  "www.bernzzdigitalsolutions.co.ke",
  "bernzzdigitalsolutions.co.ke",
  "https://dashboard-bztqantz7-ngumi22s-projects.vercel.app",
];

// Public routes that don’t require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/csrf-token",
];

// CORS Headers
const getCorsHeaders = (origin?: string) => ({
  "Access-Control-Allow-Origin": origin || "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
});

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  const method = request.method;

  // CORS Preflight Handling
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Block requests from unknown origins (except for API routes)
  if (origin && !path.startsWith("/api") && !allowedOrigins.includes(origin)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  // Allow public routes without authentication
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for authentication token (DO NOT verify it here)
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/editor/:path*",
    "/api/:path*",
  ],
};
