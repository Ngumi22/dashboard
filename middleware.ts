import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/sessions";

import { initialize } from "./lib/main";

// Allowed origins for CORS
const allowedOrigins = ["https://bernzz-front.vercel.app"];

// Route categories

const protectedRoutes = [
  "/dashboard",
  "/dashboard/:path*",
  "/api/:path*",
  "/api",
];
const publicRoutes = ["/login", "/signup"];
const unprotectedApiRoutes = [
  "/api/products",
  "/api/categories",
  "/api/verify",
];

export default async function middleware(req: NextRequest) {
  // Initialize only if not running in the Edge runtime
  if (process.env.NEXT_RUNTIME !== "edge") {
    await initialize(); // Initialize DB connection and setup, only for non-edge runtime
  }

  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);
  const isUnprotectedApiRoute = unprotectedApiRoutes.some((route) =>
    path.startsWith(route)
  );

  const origin = req.headers.get("origin") || "";
  const response = NextResponse.next();

  // CORS Handling
  if (process.env.NODE_ENV === "development") {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  } else if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  } else if (origin) {
    console.error(`Origin "${origin}" not allowed.`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
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

  // Route protection
  if (isProtectedRoute && !isUnprotectedApiRoute && !session?.userId) {
    if (path.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Please log in." }),
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
