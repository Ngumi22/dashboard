import { RowDataPacket } from "mysql2/promise";
import { cache } from "../cache";
import { getConnection } from "../database";

// Define the Category type
type Category = {
  category_id: string;
  category_name: string;
  category_image: Buffer | null;
  category_description: string;
};

export async function getUniqueCategories() {
  const cacheKey = "unique_categories";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    console.log("Returning categories from cache");
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch all unique categories with name, image, and description
    const [categories] = await connection.query<RowDataPacket[]>(
      `SELECT category_id, category_name, category_image, category_description FROM categories`
    );

    // Map the result to include the full category details
    const uniqueCategories: Category[] = categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      category_image: cat.category_image,
      category_description: cat.category_description,
    }));

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueCategories,
      expiry: Date.now() + 3600 * 1000, // 1 hour expiration
    });

    return uniqueCategories;
  } catch (error) {
    console.error("Error fetching unique categories:", error);
    throw error;
  } finally {
    connection.release();
  }
}
