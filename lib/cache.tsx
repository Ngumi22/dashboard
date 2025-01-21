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

type CacheEntry<T> = { value: T; expiry: number };

export class CacheUtil {
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly DEFAULT_TTL = 300 * 1000; // 5 minutes in milliseconds

  /**
   * Set a value in the cache with an optional TTL.
   * @param key Cache key
   * @param value Cache value
   * @param ttl Time-to-live in seconds (default: global default)
   */
  static set<T>(key: string, value: T, ttl = 300): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache if it hasn't expired.
   * @param key Cache key
   * @returns Cached value or null if expired/not found
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) return entry.value;

    this.cache.delete(key); // Clean up expired entry
    return null;
  }

  /**
   * Delete a specific key from the cache.
   * @param key Cache key
   */
  static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a given pattern.
   * @param pattern String pattern to match keys (e.g., "products_page_")
   */
  static invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) this.cache.delete(key);
    }
  }

  /**
   * Batch update cached entries matching a pattern.
   * @param pattern String pattern to match keys
   * @param updater Function to update the value of matched entries
   */
  static batchUpdate<T>(pattern: string, updater: (value: T) => T): void {
    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(pattern) && entry.expiry > Date.now()) {
        const updatedValue = updater(entry.value);
        this.set(key, updatedValue, (entry.expiry - Date.now()) / 1000);
      }
    }
  }

  /**
   * Get all cache keys.
   * @returns Array of cache keys
   */
  static keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Caching
type CacheOptions = {
  ttl?: number; // Time-to-live in seconds
};

export const getCachedData = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    const now = Date.now();

    // If TTL is defined and expired, remove the cache and return null
    if (parsed.expiry && parsed.expiry < now) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value as T;
  } catch (e) {
    console.error("Error reading from cache:", e);
    return null;
  }
};

export const setCachedData = (
  key: string,
  data: any,
  options?: CacheOptions
): void => {
  try {
    const cacheEntry = {
      value: data,
      expiry: options?.ttl ? Date.now() + options.ttl * 1000 : null, // Calculate expiry in ms
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (e) {
    console.error("Error writing to cache:", e);
  }
};

export const clearCachedData = (key?: string): void => {
  if (key) {
    // Clear specific cache entry
    localStorage.removeItem(key);
  } else {
    // Clear all cached data
    localStorage.clear();
  }
};
