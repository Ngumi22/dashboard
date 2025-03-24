import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

// JWT configuration
const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET as string
);

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

// Define protected routes and their required roles
const protectedRoutes = [
  { path: "/dashboard", roles: ["user", "editor", "admin"] },
  { path: "/admin", roles: ["admin"] },
  { path: "/editor", roles: ["editor", "admin"] },
  { path: "/api/protected", roles: ["user", "editor", "admin"] },
];

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/refresh",
];

// API routes that don't require authentication
const unprotectedApiRoutes = ["/api/verify", "/api/initialize"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers.get("origin");
  const method = request.method;

  // Normalize origin by removing trailing slashes
  const normalizedOrigin = origin?.replace(/\/$/, "");

  // CORS headers configuration
  const corsHeaders = {
    "Access-Control-Allow-Origin": normalizedOrigin || "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };

  // Handle OPTIONS requests for CORS preflight
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Check origin for non-API routes
  if (
    origin &&
    !path.startsWith("/api") &&
    !allowedOrigins.includes(normalizedOrigin!)
  ) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Create a response object with CORS headers
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Skip authentication check for public routes and unprotected API routes
  const isPublicRoute =
    publicRoutes.includes(path) ||
    publicRoutes.some((route) => path.startsWith(route));
  const isUnprotectedApiRoute = unprotectedApiRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isPublicRoute || isUnprotectedApiRoute) {
    return response;
  }

  // Check if the current path is a protected route
  const protectedRoute = protectedRoutes.find(
    (route) => path === route.path || path.startsWith(`${route.path}/`)
  );

  // If not a protected route, continue with CORS headers
  if (!protectedRoute) {
    return response;
  }

  // Get access token from cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // If no access token, redirect to login (for pages) or return 401 (for API)
  if (!accessToken) {
    if (path.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Access token required" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURIComponent(request.url));
    return NextResponse.redirect(url);
  }

  try {
    // Verify the access token
    const { payload } = await jose.jwtVerify(accessToken, JWT_ACCESS_SECRET, {
      audience: "api:access",
    });

    // Check role-based access
    const userRole = payload.role as string;
    if (!protectedRoute.roles.includes(userRole)) {
      if (path.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Insufficient permissions" }),
          {
            status: 403,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Add user info to request headers for downstream use
    response.headers.set("X-User-ID", payload.userId as string);
    response.headers.set("X-User-Role", userRole);

    return response;
  } catch (error) {
    // Token is invalid or expired - try to refresh if possible
    if (refreshToken && !path.startsWith("/api/auth/refresh")) {
      return NextResponse.redirect(new URL("/api/auth/refresh", request.url));
    }

    // For API routes, return error response
    if (path.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Invalid or expired token" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // For pages, redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURIComponent(request.url));
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/editor/:path*",
    "/api/:path*",
    "/login",
    "/signup",
  ],
};
