import { NextResponse, type NextRequest } from "next/server";

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
