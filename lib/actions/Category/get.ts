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

// NEW: Fetch all categories (flat list)
export async function fetchAllCategories(): Promise<Category[]> {
  const query = `
    SELECT
      category_id,
      category_name,
      category_image,
      category_description,
      category_status,
      parent_category_id
    FROM categories
    ORDER BY category_name
  `;

  const categories = await fetchOptimized(query);
  return processCategoryImagesBatch(categories);
}

// Core optimized queries
export async function fetchCategoryHierarchy(
  parentId: number | null = null
): Promise<Category[]> {
  const query = `
    SELECT
      c.category_id,
      c.category_name,
      c.category_image,
      c.category_description,
      c.category_status,
      c.parent_category_id,
      (
        SELECT COUNT(*) FROM categories parent
        WHERE parent.category_id = c.parent_category_id
      ) AS level
    FROM categories c
    WHERE c.parent_category_id ${parentId === null ? "IS NULL" : "= ?"}
    ORDER BY c.category_name
  `;

  const categories = await fetchOptimized(
    query,
    parentId !== null ? [parentId] : []
  );
  return processCategoryImagesBatch(categories);
}

export async function getCategorySpecs(
  category_ids: number[]
): Promise<Map<number, Specification[]>> {
  if (category_ids.length === 0) return new Map();

  const [results] = await fetchOptimized(
    `
    SELECT
      cs.category_id,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'specification_id', s.specification_id,
          'specification_name', s.specification_name
        )
      ) AS specifications
    FROM category_specifications cs
    FORCE INDEX (PRIMARY)
    JOIN specifications s USE INDEX (PRIMARY)
      ON cs.specification_id = s.specification_id
    WHERE cs.category_id IN (?)
    GROUP BY cs.category_id
  `,
    [category_ids]
  );

  const specsMap = new Map<number, Specification[]>();
  results.forEach((row: Category) => {
    specsMap.set(
      row.category_id,
      Array.isArray(row.specifications)
        ? row.specifications
        : JSON.parse(row.specifications || "[]")
    );
  });
  return specsMap;
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

export const getAllCategories = cache(
  async () => fetchAllCategories(),
  ["categories", "all"],
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

export const getCategoryWithSubcategories = cache(
  async (id: number) => fetchCategoryWithSubCatById(id),
  ["categories", "withSubcategories"],
  CACHE_OPTIONS
);

// Index-assisted name queries
export const getCategoryByName = cache(
  async (name: string) => {
    const [results] = await fetchOptimized(
      `
      SELECT * FROM categories USE INDEX (idx_category_name)
      WHERE category_name = ?
      LIMIT 1
    `,
      [name.toLowerCase()]
    );
    if (results.length === 0) return null;
    const [processed] = await processCategoryImagesBatch([results[0]]);
    return processed;
  },
  ["categories", "byName"],
  CACHE_OPTIONS
);

export const getSubcategoryByName = cache(
  async (categorySlug: string, subcategorySlug: string) => {
    const categoryName = categorySlug.replace(/-/g, " ");
    const subcategoryName = subcategorySlug.replace(/-/g, " ");

    const [results] = await fetchOptimized(
      `
      SELECT sub.*
      FROM categories AS sub USE INDEX (idx_category_name)
      STRAIGHT_JOIN categories AS parent USE INDEX (idx_category_name)
        ON sub.parent_category_id = parent.category_id
      WHERE parent.category_name = ?
        AND sub.category_name = ?
      LIMIT 1
    `,
      [categoryName.toLowerCase(), subcategoryName.toLowerCase()]
    );

    if (results.length === 0) return null;
    const [processed] = await processCategoryImagesBatch([results[0]]);
    return processed;
  },
  ["categories", "subcategoryByName"],
  CACHE_OPTIONS
);

export async function fetchCategoryWithSubCatById(
  category_id: number
): Promise<Category | null> {
  // Single query for category with subcategories
  const [results] = await fetchOptimized(
    `
    WITH main_category AS (
      SELECT * FROM categories USE INDEX (PRIMARY) WHERE category_id = ? LIMIT 1
    ),
    subcategories AS (
      SELECT * FROM categories USE INDEX (idx_parent_category)
      WHERE parent_category_id = ?
    )
    SELECT
      mc.*,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'category_id', sc.category_id,
          'category_name', sc.category_name,
          'category_image', sc.category_image,
          'category_description', sc.category_description,
          'category_status', sc.category_status,
          'parent_category_id', sc.parent_category_id
        ))
        FROM subcategories sc
      ) AS subcategories,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'specification_id', s.specification_id,
          'specification_name', s.specification_name
        ))
        FROM category_specifications cs
        JOIN specifications s ON cs.specification_id = s.specification_id
        WHERE cs.category_id = mc.category_id
      ) AS specifications
    FROM main_category mc
  `,
    [category_id, category_id]
  );

  if (results.length === 0) return null;

  const category = results[0];
  const [processed] = await processCategoryImagesBatch([category]);
  const subcategories = Array.isArray(category.subcategories)
    ? category.subcategories
    : JSON.parse(category.subcategories || "[]");

  // Process subcategory images in parallel
  const processedSubcats = await processCategoryImagesBatch(subcategories);

  return {
    ...processed,
    subcategories: processedSubcats,
    specifications: Array.isArray(category.specifications)
      ? category.specifications
      : JSON.parse(category.specifications || "[]"),
  };
}

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
