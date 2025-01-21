"use server";

import { RowDataPacket } from "mysql2/promise";
import { getConnection } from "@/lib/MysqlDB/initDb";
import { Category } from "./catType";
import { compressAndEncodeBase64 } from "../utils";
import { CacheUtil } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueCategories() {
  const cacheKey = "categories";

  const cachedData = CacheUtil.get<{ products: Category[] }>(cacheKey);

  if (cachedData) return cachedData;

  return dbOperation(async (connection) => {
    try {
      const [categories] = await connection.query(
        `SELECT category_id, category_name, category_image, category_description, category_status FROM categories`
      );

      const uniqueCategories = await Promise.all(
        categories.map(async (cat: Category) => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          category_image: cat.category_image
            ? await compressAndEncodeBase64(
                Buffer.isBuffer(cat.category_image)
                  ? cat.category_image
                  : Buffer.from(cat.category_image, "binary")
              )
            : null,

          category_description: cat.category_description,
          category_status: cat.category_status,
        }))
      );

      CacheUtil.set(cacheKey, uniqueCategories); // Use CacheUtil for caching
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

export async function fetchCategoryById(category_id: string) {
  const cacheKey = `category_${category_id}`;

  if (!category_id) throw new Error("Invalid category ID");

  const cachedCategory = CacheUtil.get<Category>(cacheKey);
  if (cachedCategory) return cachedCategory;

  const connection = await getConnection();
  try {
    // Query the database
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT category_id, category_name, category_image, category_description, category_status FROM categories WHERE category_id = ?`,
      [category_id]
    );

    if (rows.length === 0) {
      console.log(`No category found with ID ${category_id} in the database`);
      return null;
    }

    const category: Category = {
      category_id: rows[0].category_id,
      category_name: rows[0].category_name,
      category_image: rows[0].category_image
        ? await compressAndEncodeBase64(rows[0].category_image)
        : null,
      category_description: rows[0].category_description,
      category_status: rows[0].category_status,
    };

    CacheUtil.set(cacheKey, category);

    return category;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch category");
  } finally {
    connection.release();
  }
}
