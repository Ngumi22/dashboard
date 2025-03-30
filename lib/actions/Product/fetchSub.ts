"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export type MinimalProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string;
  ratings: number;
  discount: number;
  quantity: number;
  created_at: string;
  category_id: string;
  brand_id?: string;
};

export type CategoryWithProducts = {
  categoryName: string;
  subCategories: {
    name: string;
    products: MinimalProduct[];
  }[];
};

export async function fetchCategoryWithProducts(
  categoryName: string
): Promise<CategoryWithProducts | null> {
  const cacheKey = `category-products:${categoryName}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as CategoryWithProducts;
    }
    cache.delete(cacheKey);
  }

  try {
    const result = await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        `WITH RECURSIVE category_tree AS (
            SELECT category_id, category_name, parent_category_id
            FROM categories
            WHERE category_name = ? AND category_status = 'active'

            UNION ALL

            SELECT c.category_id, c.category_name, c.parent_category_id
            FROM categories c
            INNER JOIN category_tree ct ON c.parent_category_id = ct.category_id
            WHERE c.category_status = 'active'
        )
        SELECT
            ct.category_name AS subcategory_name,
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
        FROM category_tree ct
        INNER JOIN products p ON ct.category_id = p.category_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id
        LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
        WHERE p.product_status = 'approved'
        GROUP BY ct.category_name, p.product_id
        ORDER BY ct.category_name, p.product_name;
        `,
        [categoryName]
      );
      return rows;
    });

    if (!result || result.length === 0) {
      cache.set(cacheKey, { value: null, expiry: Date.now() + 1000 * 60 * 5 });
      return null;
    }

    const groupedProducts: Record<string, MinimalProduct[]> = {};
    for (const row of result) {
      if (!groupedProducts[row.subcategory_name]) {
        groupedProducts[row.subcategory_name] = [];
      }

      const base64Image = row.main_image
        ? (await compressAndEncodeBase64(row.main_image)) || ""
        : "";

      groupedProducts[row.subcategory_name].push({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        main_image: base64Image,
        ratings: parseFloat(row.ratings),
        discount: parseFloat(row.discount),
        quantity: row.quantity,
        created_at: row.created_at,
        category_id: row.category_id,
      });
    }

    const subCategories = Object.entries(groupedProducts).map(
      ([name, products]) => ({ name, products })
    );

    const response: CategoryWithProducts = {
      categoryName,
      subCategories,
    };

    cache.set(cacheKey, {
      value: response,
      expiry: Date.now() + 1000 * 60 * 5,
    });
    return response;
  } catch (error: any) {
    console.error(`Error fetching category ${categoryName}:`, error);
    throw new Error(`Failed to fetch category data: ${error.message}`);
  }
}
