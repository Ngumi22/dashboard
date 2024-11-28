"use server";

import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { cache } from "@/lib/cache";
import { getConnection } from "@/lib/database";

// Define the Category type
type Category = {
  category_id: string;
  category_name: string;
  category_image: Buffer | null;
  category_description: string;
  status: "active" | "inactive";
};

export async function getUniqueCategories() {
  const cacheKey = "unique_categories";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    // console.log("Returning categories from cache");
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
      `SELECT category_id, category_name, category_image, category_description, status FROM categories`
    );

    // Map the result to include the full category details
    const uniqueCategories: Category[] = categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      category_image: cat.category_image,
      category_description: cat.category_description,
      status: cat.status,
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

export async function getCategorySpecs(categoryID: string) {
  const connection = await getConnection();
  try {
    // Query to fetch category and its specifications
    const [result] = await connection.query<RowDataPacket[]>(
      `
      SELECT
        c.category_name,
        CONCAT(
          '[',
          GROUP_CONCAT(
            JSON_OBJECT(
              'category_id', c.category_id,
              'specification_name', s.specification_name
            ) ORDER BY s.specification_name
          ),
          ']'
        ) AS catSpecs
      FROM categories c
      JOIN category_specifications cs ON c.category_id = cs.category_id
      JOIN specifications s ON cs.specification_id = s.specification_id
      WHERE c.category_id = ?
      GROUP BY c.category_id
    `,
      [categoryID]
    );

    // Ensure result is an array and has at least one element
    if (Array.isArray(result) && result.length > 0) {
      return {
        category_name: result[0].category_name, // Access category_name safely
        catSpecs: JSON.parse(result[0].catSpecs), // Parse the JSON string into an object
      };
    } else {
      return null; // If no matching category is found
    }
  } catch (error) {
    console.error("Error fetching catSpecs:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchCategoryByIdFromDb(
  id: string
): Promise<Category | null> {
  const cacheKey = `category_${id}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category;
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Query the database
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT category_id, category_name, category_image, category_description, status FROM categories WHERE category_id = ?`,
      [id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      return null;
    }

    // Map database results to a Category object
    const category: Category = {
      category_id: rows[0].category_id,
      category_name: rows[0].category_name,
      category_image: rows[0].category_image,
      category_description: rows[0].category_description,
      status: rows[0].status,
    };

    // Cache the result
    cache.set(cacheKey, {
      value: category,
      expiry: Date.now() + 3600 * 1000, // Cache expiry: 1 hour
    });

    return category;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch category");
  } finally {
    connection.release();
  }
}
