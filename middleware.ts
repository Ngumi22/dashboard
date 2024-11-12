import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/sessions";

// Define allowed origins for CORS
const allowedOrigins = ["https://bernzz-front.vercel.app"];

// Specify protected, public, and unprotected API routes
const protectedRoutes = ["/", "/dashboard", "/dashboard/:path*", "/api/:path*"];
const publicRoutes = ["/login", "/signup"];
const unprotectedApiRoutes = [
  "/api/products",
  "/api/categories",
  "/api/verify",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine if the route is protected, public, or an unprotected API route
  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );
  const isUnprotectedApiRoute = unprotectedApiRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );

  // Handle CORS for all routes, particularly API routes
  const origin = req.headers.get("origin") || "";
  const response = NextResponse.next();

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
    console.log(`Origin "${origin}" not allowed by CORS policy`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Handle preflight OPTIONS request
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

  // Check for session and handle protected routes
  const sessionCookie = req.cookies.get("session")?.value;
  let session;
  try {
    session = sessionCookie ? await decrypt(sessionCookie) : null;
  } catch (error) {
    console.error("Error decrypting session:", error);
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect or return 401 for protected routes, except for unprotected API routes
  if (isProtectedRoute && !isUnprotectedApiRoute && !session?.userId) {
    if (path.startsWith("/api")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect logged-in users accessing public routes to the dashboard
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
