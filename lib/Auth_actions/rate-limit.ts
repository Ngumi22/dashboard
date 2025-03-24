import { kv } from "@vercel/kv";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiting implementation using Vercel KV (Redis)
 *
 * @param key - Unique identifier for the rate limit (e.g., 'login:user@example.com:127.0.0.1')
 * @param limit - Maximum number of attempts allowed
 * @param window - Time window in seconds
 * @returns Object containing rate limit information
 */
export async function rateLimit(
  key: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  // Use Redis if available, otherwise use in-memory fallback
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return redisRateLimit(key, limit, window);
  } else {
    return inMemoryRateLimit(key, limit, window);
  }
}

// Redis-based rate limiting using Vercel KV
async function redisRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const fullKey = `ratelimit:${key}`;

  try {
    // Increment the counter
    const count = await kv.incr(fullKey);

    // Set expiration on first request
    if (count === 1) {
      await kv.expire(fullKey, window);
    }

    // Get TTL (time-to-live) for the key
    const ttl = await kv.ttl(fullKey);
    const reset = now + ttl;

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fallback to allowing the request in case of Redis error
    return {
      success: true,
      limit,
      remaining: 1,
      reset: now + window,
    };
  }
}

// In-memory fallback for rate limiting (for development or when Redis is unavailable)
const inMemoryStore = new Map<string, { count: number; reset: number }>();

function inMemoryRateLimit(
  key: string,
  limit: number,
  window: number
): RateLimitResult {
  const now = Math.floor(Date.now() / 1000);
  const fullKey = `ratelimit:${key}`;

  // Clean up expired entries
  for (const [storedKey, data] of inMemoryStore.entries()) {
    if (data.reset < now) {
      inMemoryStore.delete(storedKey);
    }
  }

  // Get or create entry
  let entry = inMemoryStore.get(fullKey);

  if (!entry) {
    entry = { count: 0, reset: now + window };
    inMemoryStore.set(fullKey, entry);
  }

  // If the entry has expired, reset it
  if (entry.reset < now) {
    entry.count = 0;
    entry.reset = now + window;
  }

  // Increment the counter
  entry.count++;

  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.reset,
  };
}
