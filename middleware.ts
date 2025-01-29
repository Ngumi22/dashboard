import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/actions/Auth/sessions";

// Allowed origins for CORS
const allowedOrigins = [
  "https://bernzz-front.vercel.app",
  "https://www.bernzzdigitalsolutions.co.ke", // Ensure this is included
  "https://dashboard-five-wheat.vercel.app",
  "http://localhost:3000", // Allow localhost explicitly for development
];

// Route categories
const protectedRoutes = [
  "/dashboard",
  "/dashboard/:path*",
  "/api/:path*",
  "/api",
];
const publicRoutes = ["/login", "/signup"];
const unprotectedApiRoutes = ["/api/verify", "/api/initialize"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const origin = req.headers.get("origin");
  const response = NextResponse.next();

  // Normalize origin by removing trailing slashes
  const normalizedOrigin = origin?.replace(/\/$/, "");

  // Allow requests with no origin (like browser navigation or same-origin requests)
  if (!origin && process.env.NODE_ENV === "development") {
    console.log("No origin header, allowing localhost for development.");
  } else if (!origin) {
    console.log("No origin header, allowing request.");
  } else if (normalizedOrigin && !allowedOrigins.includes(normalizedOrigin)) {
    console.error(`Origin "${normalizedOrigin}" not allowed.`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": normalizedOrigin || "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // Apply CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) =>
    response.headers.set(key, value)
  );

  // OPTIONS request handling
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Session Handling
  const sessionCookie = req.cookies.get("session")?.value;
  let session;
  try {
    session = sessionCookie ? await decrypt(sessionCookie) : null;
  } catch (error) {
    console.error("Session decryption error:", error);
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Route Protection Logic
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);
  const isUnprotectedApiRoute = unprotectedApiRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !isUnprotectedApiRoute && !session?.userId) {
    if (path.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: You must be logged in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
