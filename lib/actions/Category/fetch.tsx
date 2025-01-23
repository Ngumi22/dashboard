"use server";

import { Category } from "./catType";
import { compressAndEncodeBase64 } from "../utils";
import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueCategories(): Promise<Category[]> {
  const cacheKey = "categories";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category[]; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return dbOperation(async (connection) => {
    try {
      const [categories] = await connection.query(
        `SELECT category_id, category_name, category_image, category_description, category_status FROM categories`
      );

      // Return an empty array if no categories found
      if (!categories || categories.length === 0) {
        cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
        return [];
      }

      const uniqueCategories: Category[] = await Promise.all(
        categories.map(async (cat: any) => ({
          category_id: cat.category_id,
          category_name: cat.category_name,

          category_image: cat.category_image
            ? await compressAndEncodeBase64(cat.category_image)
            : null,

          category_description: cat.category_description,
          category_status: cat.category_status,
        }))
      );

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: uniqueCategories,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });
      return uniqueCategories;
    } catch (error) {
      console.error("Error fetching unique categories:", error);
      throw error;
    }
  });
}

export async function getCategorySpecs(category_id: string) {
  return dbOperation(async (connection) => {
    try {
      // Query to fetch category and its specifications
      const [result] = await connection.query(
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
        [category_id]
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
    }
  });
}

// Function to fetch a category by ID
export async function fetchCategoryById(
  category_id: number
): Promise<Category | null> {
  const cacheKey = `category_${category_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category; // Return cached data as Category
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `SELECT category_id, category_name, category_image, category_description, category_status FROM categories WHERE category_id = ?`,
      [category_id]
    );

    if (!rows || rows.length === 0) {
      return null; // Return null if no banner is found
    }

    const category = rows[0];
    const processedCategory: Category = {
      category_id: category.category_id,
      category_name: category.category_name,
      category_image: category.category_image
        ? await compressAndEncodeBase64(category.category_image)
        : null,
      category_description: category.category_description,
      category_status: category.category_status,
    };

    cache.set(cacheKey, {
      value: processedCategory,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    return processedCategory;
  });
}
