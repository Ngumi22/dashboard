import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.append("Access-Control-Allow-Origin", "http://localhost:3001");
  return res;
}

export const constructor = {
  matcher: ["/api/:path*"],
};
