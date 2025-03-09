"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

type Tag = {
  tag_name: string;
};

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

export async function getProductTags(product_id: number) {
  // Use a unique cache key for each product
  const cacheKey = `tagData:${product_id}`;

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
      const [tags] = await connection.query(
        `
        SELECT
            t.tag_name
        FROM
            product_tags pt
        JOIN
            tags t ON pt.tag_id = t.tag_id
        WHERE
            pt.product_id = ?;`,
        [product_id]
      );

      // Extract unique tag names (if needed, though DISTINCT is not required in the query)
      const uniqueTags = Array.from(
        new Set(tags.map((tag: Tag) => tag.tag_name))
      );
      const result = { uniqueTags };

      // Cache the result with an expiry time (10 hours)
      cache.set(cacheKey, {
        value: result,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return result;
    } catch (error) {
      console.error("Error fetching product tags:", error);
      throw error; // Re-throw the error for the caller to handle
    } finally {
      connection.release(); // Ensure the connection is always released
    }
  });
}
