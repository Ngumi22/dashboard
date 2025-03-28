import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

// Allowed origins for CORS
const allowedOrigins = [
  "https://bernzz-front.vercel.app",
  "https://www.bernzzdigitalsolutions.co.ke",
  "https://dashboard-five-wheat.vercel.app",
  "http://localhost:3000",
  "bernzzdigitalsolutions.co.ke",
  "https://dashboard-bztqantz7-ngumi22s-projects.vercel.app",
].map((origin) => origin.toLowerCase().replace(/^www\./, "")); // Normalize

// Public routes that don’t require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/csrf-token",
];

// JWT Secret for Access Token Verification
const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET
);

// CORS Headers Function
const getCorsHeaders = (origin?: string) => ({
  "Access-Control-Allow-Origin": origin || "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
});

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers
    .get("origin")
    ?.replace(/\/$/, "")
    .toLowerCase();
  const method = request.method;

  // **🚨 Security Fix: Block Middleware Subrequest Header 🚨**
  if (request.headers.has("x-middleware-subrequest")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // **Handle CORS Preflight Requests**
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // **CORS Protection: Allow Only Approved Origins**
  if (origin && !path.startsWith("/api") && !allowedOrigins.includes(origin)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  // **Allow Public Routes**
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // **🚀 Require Authentication & Verify Token**
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify JWT Token
    const { payload } = await jose.jwtVerify(accessToken, JWT_ACCESS_SECRET, {
      audience: "api:access",
      clockTolerance: 15,
    });

    // **🚀 Admin Restriction for /admin & /dashboard**
    if (path.startsWith("/admin") || path.startsWith("/dashboard")) {
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url)); // Redirect unauthorized users
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return NextResponse.redirect(new URL("/login", request.url)); // Expired or invalid token
  }
}

// **Apply Middleware to Secure Routes**
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/editor/:path*",
    "/api/:path*",
  ],
};
