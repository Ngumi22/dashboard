import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  lastReset: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimiter(
  ip: string,
  limit: number,
  windowMs: number
): NextResponse | void {
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, lastReset: Date.now() });
  }

  const entry = rateLimitMap.get(ip)!;

  // Reset the count if the window has passed
  if (Date.now() - entry.lastReset > windowMs) {
    entry.count = 0;
    entry.lastReset = Date.now();
  }

  // Increment the request count
  entry.count += 1;

  // Check if the request count exceeds the limit
  if (entry.count > limit) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
}

// Utility function to get IP address
export function getIpAddress(): string {
  const headers = new Headers();
  return (
    headers.get("x-forwarded-for") || headers.get("x-real-ip") || "127.0.0.1" // Default to localhost if unavailable
  );
}
