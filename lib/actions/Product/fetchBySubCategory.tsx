"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export type MinimalProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string; // Base64 encoded
  ratings: number;
  discount: number;
  quantity: number;
  created_at: string;
  category_id: string;
};

export type ProductSubCategory = {
  name: string;
  products: MinimalProduct[];
};

export type SubCategory = {
  category_id: number;
  category_name: string;
};

export async function fetchSubCategories(
  categoryName: string
): Promise<SubCategory[]> {
  const cacheKey = `subCategories:${categoryName}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey); // Remove expired cache
  }

  try {
    const result = await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        `WITH RECURSIVE subcategories AS (
          SELECT
              category_id,
              category_name,
              parent_category_id
          FROM
              categories
          WHERE
              category_name = ?

          UNION ALL

          SELECT
              c.category_id,
              c.category_name,
              c.parent_category_id
          FROM
              categories c
          INNER JOIN
              subcategories s
          ON
              c.parent_category_id = s.category_id
        )

        SELECT
            category_id,
            category_name
        FROM
            subcategories
        WHERE
            parent_category_id IS NOT NULL;`,
        [categoryName]
      );

      return rows as SubCategory[];
    });

    // Return an empty array if no subcategories found
    if (!result || result.length === 0) {
      cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 }); // Cache empty result
      return [];
    }

    // Store in cache for 5 minutes
    cache.set(cacheKey, {
      value: result,
      expiry: Date.now() + 1000 * 60 * 5, // Cache for 5 minutes
    });

    return result;
  } catch (error: any) {
    console.error(`Error fetching subcategories for ${categoryName}:`, error);
    throw new Error(`Failed to fetch subcategories: ${error.message}`);
  }
}

export async function fetchProductsBySubCategory(
  sub_category_name: string
): Promise<ProductSubCategory | null> {
  const cacheKey = `subCategoryProducts:${sub_category_name}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as ProductSubCategory;
    }
    cache.delete(cacheKey); // Remove expired cache
  }

  try {
    const result = await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        `WITH RECURSIVE subcategories AS (
          SELECT
              category_id,
              category_name,
              parent_category_id
          FROM categories
          WHERE category_name = ?

          UNION ALL

          SELECT
              c.category_id,
              c.category_name,
              c.parent_category_id
          FROM categories c
          INNER JOIN subcategories s
          ON c.parent_category_id = s.category_id
        )

        SELECT
            s.category_name AS subcategory_name,
            p.product_id AS id,
            p.product_name AS name,
            p.product_description AS description,
            p.product_price AS price,
            p.product_discount AS discount,
            p.product_quantity AS quantity,
            p.created_at AS created_at,
            p.category_id AS category_id,
            MAX(pi.main_image) AS main_image,
            COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings
        FROM subcategories s
        LEFT JOIN products p ON s.category_id = p.category_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id
        LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
        WHERE s.parent_category_id IS NOT NULL
        GROUP BY s.category_name, p.product_id
        ORDER BY s.category_name, p.product_name`,
        [sub_category_name]
      );

      return rows;
    });

    // Return null if no rows found
    if (!result || result.length === 0) {
      cache.set(cacheKey, { value: null, expiry: Date.now() + 3600 * 10 }); // Cache null result
      return null;
    }

    // Group products by subcategory name
    const groupedProducts: Record<string, MinimalProduct[]> = {};
    for (const row of result) {
      if (!groupedProducts[row.subcategory_name]) {
        groupedProducts[row.subcategory_name] = [];
      }

      // Convert images to Base64 (if applicable)
      const base64Image = row.main_image
        ? await compressAndEncodeBase64(row.main_image)
        : "";

      groupedProducts[row.subcategory_name].push({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        main_image: base64Image || "", // Base64 string
        ratings: parseFloat(row.ratings),
        discount: parseFloat(row.discount),
        quantity: row.quantity,
        created_at: row.created_at,
        category_id: row.category_id,
      });
    }

    // Get the subcategory and its products
    const subcategory = groupedProducts[sub_category_name];
    if (!subcategory) {
      cache.set(cacheKey, { value: null, expiry: Date.now() + 3600 * 10 }); // Cache null result
      return null; // No products found for the subcategory
    }

    const category: ProductSubCategory = {
      name: sub_category_name,
      products: subcategory,
    };

    // Store in cache for 5 minutes
    cache.set(cacheKey, {
      value: category,
      expiry: Date.now() + 1000 * 60 * 5, // Cache for 5 minutes
    });

    return category;
  } catch (error: any) {
    console.error(
      `Error fetching products for category ${sub_category_name}:`,
      error
    );
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}
