"use server";

import { compressAndEncodeBase64 } from "../utils";
import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { Category, Specification } from "./catType";

export async function fetchCategoryWithSubCat(): Promise<Category[]> {
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
          parent_category_id: cat.parent_category_id,
          path: cat.path,
          level: cat.level,
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

export async function fetchCategoryWithSubCatById(
  category_id: number
): Promise<Category | null> {
  const cacheKey = `category_${category_id}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category;
    }
    cache.delete(cacheKey);
  }

  return dbOperation(async (connection) => {
    try {
      // Fetch base category information
      const [categories] = await connection.query(
        `
        SELECT
          category_id,
          category_name,
          category_image,
          category_description,
          category_status,
          parent_category_id
        FROM categories
        WHERE category_id = ?`,
        [category_id]
      );

      if (!categories || categories.length === 0) {
        return null;
      }

      const category = categories[0];

      // Fetch subcategories
      const [subcategories] = await connection.query(
        `
        SELECT
          category_id,
          category_name,
          category_image,
          category_description,
          category_status,
          parent_category_id
        FROM categories
        WHERE parent_category_id = ?`,
        [category_id]
      );

      // Fetch specifications
      const [specResults] = await connection.query(
        `
        SELECT
          s.specification_id,
          s.specification_name
        FROM category_specifications cs
        JOIN specifications s ON cs.specification_id = s.specification_id
        WHERE cs.category_id = ?`,
        [category_id]
      );

      // Process image and construct response
      const processedCategory: Category = {
        ...category,
        category_image: category.category_image
          ? await compressAndEncodeBase64(category.category_image)
          : null,
        subcategories: subcategories.map(async (subcat: any) => ({
          category_id: subcat.category_id,
          category_name: subcat.category_name,
          category_image: subcat.category_image
            ? await compressAndEncodeBase64(subcat.category_image)
            : null,
          category_description: subcat.category_description,
          category_status: subcat.category_status,
          parent_category_id: subcat.parent_category_id,
        })),
        specifications: specResults.map((spec: any) => ({
          specification_id: spec.specification_id,
          specification_name: spec.specification_name,
        })),
      };

      // Cache the enriched category data
      cache.set(cacheKey, {
        value: processedCategory,
        expiry: Date.now() + 3600 * 10, // 10 hours
      });

      return processedCategory;
    } catch (error) {
      console.error(`Error fetching category ${category_id}:`, error);
      throw error;
    }
  });
}

// Function to fetch a category by ID
export async function fetchCategoryById(
  category_id: number
): Promise<Category | null> {
  const cacheKey = `category_${category_id}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category;
    }
    cache.delete(cacheKey);
  }

  return dbOperation(async (connection) => {
    try {
      // Fetch base category information
      const [categories] = await connection.query(
        `SELECT
          category_id,
          category_name,
          category_image,
          category_description,
          category_status,
          parent_category_id
         FROM categories
         WHERE category_id = ?`,
        [category_id]
      );

      if (!categories || categories.length === 0) {
        return null;
      }

      const category = categories[0];

      // Fetch specifications in parallel
      const [specResults] = await connection.query(
        `SELECT
          s.specification_id,
          s.specification_name
         FROM category_specifications cs
         JOIN specifications s ON cs.specification_id = s.specification_id
         WHERE cs.category_id = ?`,
        [category_id]
      );

      // Process image and construct response
      const processedCategory: Category = {
        ...category,
        category_image: category.category_image
          ? await compressAndEncodeBase64(category.category_image)
          : null,
        specifications: specResults.map((spec: any) => ({
          specification_id: spec.specification_id,
          specification_name: spec.specification_name,
        })),
      };

      // Cache the enriched category data
      cache.set(cacheKey, {
        value: processedCategory,
        expiry: Date.now() + 3600 * 10, // 10 hours
      });

      return processedCategory;
    } catch (error) {
      console.error(`Error fetching category ${category_id}:`, error);
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

export async function fetchCategoryTreeWithSpecs(
  category_id: number
): Promise<Category[]> {
  const cacheKey = `categoryTreeWithSpecs_${category_id}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category[];
    }
    cache.delete(cacheKey);
  }

  return dbOperation(async (connection) => {
    try {
      // Step 1: Fetch category hierarchy using recursive CTE
      const [hierarchy] = await connection.query(
        `
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
          FROM categories
          WHERE category_id = ?
          UNION ALL
          SELECT
            c.category_id,
            c.category_name,
            c.category_image,
            c.category_description,
            c.category_status,
            c.parent_category_id,
            CONCAT(ch.path, ' > ', c.category_id),
            ch.level + 1
          FROM categories c
          INNER JOIN CategoryHierarchy ch ON c.parent_category_id = ch.category_id
        )
        SELECT * FROM CategoryHierarchy ORDER BY path;
        `,
        [category_id]
      );

      if (!hierarchy || hierarchy.length === 0) {
        return [];
      }

      // Extract category IDs to fetch specs
      const categoryIds = hierarchy.map((cat: any) => cat.category_id);

      // Step 2: Fetch specifications for all category IDs
      const specsMap = await getCategorySpecs(categoryIds);

      // Step 3: Process images and merge specs into each category
      const processedCategories = await Promise.all(
        hierarchy.map(async (cat: any) => ({
          ...cat,
          category_image: cat.category_image
            ? await compressAndEncodeBase64(cat.category_image)
            : null,
          specifications: specsMap.get(cat.category_id) || [],
        }))
      );

      // Cache the result
      cache.set(cacheKey, {
        value: processedCategories,
        expiry: Date.now() + 3600 * 10, // 10 hours
      });

      return processedCategories;
    } catch (error) {
      console.error("Error fetching category tree with specs:", error);
      throw error;
    }
  });
}

export async function fetchCategoryByName(categoryName: string) {
  const cacheKey = `${categoryName}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Category[];
    }
    cache.delete(cacheKey);
  }
  return dbOperation(async (connection) => {
    try {
      // Step 1: Fetch category hierarchy using recursive CTE
      const result = await connection.query(
        `SELECT * FROM categories
      WHERE LOWER(category_name) = LOWER(${categoryName})`
      );

      if (result.rows.length === 0) {
        return null; // No category found
      }
      // Cache the result
      cache.set(cacheKey, {
        value: result.rows,
        expiry: Date.now() + 3600 * 10, // 10 hours
      });
      return result.rows[0]; // Return the first matching category
    } catch (error) {
      console.error("Error fetching category tree with specs:", error);
      throw error;
    }
  });
}

export const fetchSubcategoryByName = async (
  categorySlug: string,
  subcategorySlug: string
) => {
  return dbOperation(async (connection) => {
    try {
      // Generate the category and subcategory names from the slugs
      const categoryName = categorySlug.replace(/-/g, " ");
      const subcategoryName = subcategorySlug.replace(/-/g, " ");

      // Example using raw SQL (Vercel Postgres)
      const result = await connection.query`
      SELECT sub.* FROM categories AS sub
      JOIN categories AS parent ON sub.parent_category_id = parent.category_id
      WHERE LOWER(parent.category_name) = LOWER(${categoryName})
      AND LOWER(sub.category_name) = LOWER(${subcategoryName})
    `;

      if (result.rows.length === 0) {
        return null; // No subcategory found
      }

      return result.rows[0]; // Return the first matching subcategory
    } catch (error) {
      console.error("Error fetching subcategory by slug:", error);
      throw error;
    }
  });
};

export async function generateMetadata({ params }: any) {
  const { categorySlug, subcategorySlug } = params;

  return {
    title: subcategorySlug
      ? `${subcategorySlug} - ${categorySlug} | Electronics Store`
      : `${categorySlug} | Electronics Store`,
    description: `Explore ${
      subcategorySlug || categorySlug
    } products at the best prices.`,
    openGraph: {
      title: `${subcategorySlug || categorySlug} - Electronics Store`,
      description: `Find the best deals on ${subcategorySlug || categorySlug}.`,
      type: "website",
    },
  };
}
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
