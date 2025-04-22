"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { Category, Specification } from "./catType";
import { compressAndEncodeBase64 } from "../utils";
import { unstable_cache as cache } from "next/cache";
// Cached server actions
const CACHE_OPTIONS = { revalidate: 30 * 60 }; // 30 minutes

async function fetchOptimized(
  query: string,
  params: any[] = [],
  useCache = true
): Promise<any[]> {
  return dbOperation(async (connection) => {
    // If there is a JOIN (without STRAIGHT_JOIN), insert the optimizer hint.
    if (query.includes("JOIN") && !query.includes("STRAIGHT_JOIN")) {
      // This replaces the first occurrence of "SELECT" (case-insensitive)
      // with "SELECT /*+ BKA(cs) */"
      query = query.replace(/^SELECT/i, "SELECT /*+ BKA(cs) */");
    }

    // If caching is enabled, insert SQL_CACHE into the query.
    if (useCache) {
      // Check if the query already uses DISTINCT (possibly with an optimizer hint)
      if (/^SELECT\s+(\/\*\+\s*[^*]+\*\/\s+)?DISTINCT\b/i.test(query)) {
        // Insert SQL_CACHE right after DISTINCT
        query = query.replace(
          /^(SELECT\s+(\/\*\+\s*[^*]+\*\/\s+)?DISTINCT\b)/i,
          "$1 SQL_CACHE"
        );
      } else {
        // Otherwise, simply insert SQL_CACHE after SELECT.
        query = query.replace(/^SELECT/i, "SELECT SQL_CACHE");
      }
    }

    const [results] = await connection.query({
      sql: query,
      values: params,
      rowsAsArray: false,
      nestTables: false,
    });

    return results || [];
  });
}

// Process images in parallel with batch optimization
async function processCategoryImagesBatch(
  categories: any[]
): Promise<Category[]> {
  const imageProcessing = categories.map((cat) =>
    cat.category_image
      ? compressAndEncodeBase64(cat.category_image).catch(() => null)
      : Promise.resolve(null)
  );

  const processedImages = await Promise.all(imageProcessing);

  return categories.map((cat, index) => ({
    ...cat,
    category_image: processedImages[index],
  }));
}

export const getUniqueCategories = cache(
  async () => {
    const query = `
      SELECT DISTINCT
        category_id,
        category_name,
        category_image,
        category_description,
        category_status
      FROM categories
      WHERE category_status = 'active'
      AND parent_category_id IS NULL
      ORDER BY category_name
    `;
    const categories = await fetchOptimized(query);
    return processCategoryImagesBatch(categories);
  },
  ["categories", "unique"],
  CACHE_OPTIONS
);

export const getCategoryById = cache(
  async (id: number) => {
    const [results] = await fetchOptimized(
      `
      SELECT
        c.*,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'specification_id', s.specification_id,
              'specification_name', s.specification_name
            )
          )
          FROM category_specifications cs
          JOIN specifications s ON cs.specification_id = s.specification_id
          WHERE cs.category_id = c.category_id
        ) AS specifications
      FROM categories c USE INDEX (PRIMARY)
      WHERE c.category_id = ?
      LIMIT 1
    `,
      [id]
    );

    if (results.length === 0) return null;
    const [processed] = await processCategoryImagesBatch([results[0]]);
    return {
      ...processed,
      specifications: Array.isArray(results[0].specifications)
        ? results[0].specifications
        : JSON.parse(results[0].specifications || "[]"),
    };
  },
  ["categories", "byId"],
  CACHE_OPTIONS
);

export async function fetchCategoryWithSubCat(): Promise<Category[]> {
  return dbOperation(async (connection) => {
    try {
      const [categories] = await connection.query(`
        WITH RECURSIVE CategoryHierarchy AS (
          SELECT
            category_id,
            category_name,
            category_image,
            category_description,
            category_status,
            parent_category_id,
            CAST(category_id AS CHAR(255)) AS path,
            0 AS level
          FROM
            categories
          WHERE
            parent_category_id IS NULL

          UNION ALL

          SELECT
            c.category_id,
            c.category_name,
            c.category_image,
            c.category_description,
            c.category_status,
            c.parent_category_id,
            CONCAT(ch.path, ' > ', c.category_id) AS path,
            ch.level + 1 AS level
          FROM
            categories c
          INNER JOIN
            CategoryHierarchy ch ON c.parent_category_id = ch.category_id
        )
        SELECT
          category_id,
          category_name,
          category_image,
          category_description,
          category_status,
          parent_category_id,
          path,
          level
        FROM
          CategoryHierarchy
        ORDER BY
          path;
      `);

      // Return an empty array if no categories found
      if (!categories || categories.length === 0) {
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
          parent_category_id: cat.parent_category_id,
          path: cat.path,
          level: cat.level,
        }))
      );

      return uniqueCategories;
    } catch (error) {
      console.error("Error fetching unique categories:", error);
      throw error;
    }
  });
}

export async function fetchCategoryWithSubCatByCatId(
  category_id: number
): Promise<Category[]> {
  return dbOperation(async (connection) => {
    try {
      const [categories] = await connection.query(
        `
        SELECT
          category_id,
          category_name,
          category_image,
          category_description,
          category_status,
          parent_category_id
        FROM
          categories
        WHERE
          parent_category_id = ?
        ORDER BY
          category_name
        `,
        [category_id]
      );

      if (!categories || categories.length === 0) {
        return [];
      }

      const processedCategories: Category[] = await Promise.all(
        categories.map(async (cat: any) => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          category_image: cat.category_image
            ? await compressAndEncodeBase64(cat.category_image)
            : null,
          category_description: cat.category_description,
          category_status: cat.category_status,
          parent_category_id: cat.parent_category_id,
        }))
      );

      return processedCategories;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  });
}

export async function getCategorySpecs(category_ids: number[]) {
  return dbOperation(async (connection) => {
    try {
      const [results] = await connection.query(
        `SELECT
          c.category_id,
          COALESCE(
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'specification_id', s.specification_id,
                'specification_name', s.specification_name
              )
            ),
            JSON_ARRAY()
          ) AS specifications
         FROM categories c
         LEFT JOIN category_specifications cs
           ON c.category_id = cs.category_id
         LEFT JOIN specifications s
           ON cs.specification_id = s.specification_id
         WHERE c.category_id IN (?)
         GROUP BY c.category_id`,
        [category_ids]
      );

      const specsMap = new Map<number, Specification[]>();
      for (const row of results) {
        // Handle both parsed object and JSON string cases
        const specs =
          typeof row.specifications === "string"
            ? JSON.parse(row.specifications)
            : row.specifications || [];

        specsMap.set(row.category_id, specs);
      }
      return specsMap;
    } catch (error) {
      console.error("Error fetching category specs:", error);
      throw error;
    }
  });
}
