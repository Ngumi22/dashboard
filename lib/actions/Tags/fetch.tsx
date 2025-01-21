"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueTags() {
  const cacheKey = "tags";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      const [tags] = await connection.query(`
        SELECT DISTINCT t.tag_name FROM tags t
        JOIN product_tags pt ON t.tag_id = pt.tag_id
      `);

      const uniqueTags = tags.map((tag: { tag_name: any }) => tag.tag_name);
      const result = { uniqueTags };

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: result,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return result;
    } catch (error) {
      console.error("Error fetching unique tags:", error);
      throw error;
    } finally {
      connection.release();
    }
  });
}
