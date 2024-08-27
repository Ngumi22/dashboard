export const cache = new Map<string, { value: any; expiry: number }>();

export function setCache(key: string, value: any, { ttl = 300 } = {}): void {
  const expiry = Date.now() + ttl * 1000; // Convert ttl to milliseconds
  cache.set(key, { value, expiry });
}

export function getCache(key: string): any | null {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key); // Remove expired cache
    return null;
  }

  return cached.value;
}
