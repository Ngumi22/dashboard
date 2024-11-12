import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/sessions";

// Define allowed origins for CORS
const allowedOrigins = ["https://bernzz-front.vercel.app"];

// Specify protected and public routes
const protectedRoutes = ["/", "/dashboard", "/dashboard/:path*"];
const publicRoutes = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine if the route is protected or public
  const isProtectedRoute = protectedRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    new RegExp(`^${route.replace(/:\w+\*/g, ".*")}$`).test(path)
  );

  // Handle CORS for all routes, particularly API routes
  const origin = req.headers.get("origin") || ""; // Default to empty string if no origin
  const response = NextResponse.next();

  if (process.env.NODE_ENV === "development") {
    // Allow all origins in development
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
    // Reject requests from disallowed origins in production
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

  // Check for session and redirect if needed
  const sessionCookie = cookies().get("session")?.value;
  let session;
  try {
    session = sessionCookie ? await decrypt(sessionCookie) : null;
  } catch (error) {
    console.error("Error decrypting session:", error);
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect based on session state and route type
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
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
