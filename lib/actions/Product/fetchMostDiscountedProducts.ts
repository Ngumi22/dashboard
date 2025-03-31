"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { CACHE_TTL } from "@/lib/Constants";

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
};

export type DiscountedCategory = {
  name: string;
  products: MinimalProduct[];
};
// Define the raw row type from the database
type RawProductRow = {
  category_id: string;
  category_name: string;
  id: number;
  name: string;
  description: string;
  price: string;
  created_at: string;
  main_image: string;
  ratings: string;
  discount: string;
  quantity: number;
};

export async function fetchAllTopDiscountedProducts(): Promise<
  DiscountedCategory[]
> {
  const cacheKey = "topDiscountedProducts";

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() < cachedData.expiry) {
    return JSON.parse(JSON.stringify(cachedData.value)) as DiscountedCategory[];
  }

  return dbOperation(async (connection) => {
    try {
      const [rows] = await connection.query(`
        WITH ranked_products AS (
          SELECT
            main_c.category_name AS category_name,
            p.product_id AS id,
            p.product_name AS name,
            p.product_description AS description,
            p.product_price AS price,
            DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
            (SELECT pi.main_image FROM product_images pi WHERE pi.product_id = p.product_id LIMIT 1) AS main_image,
            COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
            p.product_discount AS discount,
            p.product_quantity AS quantity,
            p.category_id,
            ROW_NUMBER() OVER (PARTITION BY main_c.category_name ORDER BY p.product_discount DESC) AS \`rank\`
          FROM categories main_c
          JOIN categories sub_c ON main_c.category_id = sub_c.parent_category_id OR main_c.category_id = sub_c.category_id
          JOIN products p ON sub_c.category_id = p.category_id
          LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
          WHERE
              main_c.category_status = 'active'
              AND main_c.parent_category_id IS NULL
              AND p.product_status = 'approved'
              AND p.product_discount > 0
          GROUP BY main_c.category_name, p.product_id
        )
        SELECT * FROM ranked_products WHERE \`rank\` <= 5;
      `);

      if (!Array.isArray(rows)) {
        console.error("❌ Unexpected query result:", rows);
        throw new Error("Database query did not return an array.");
      }

      // Group by category
      const categoryMap: Record<string, DiscountedCategory> = {};

      for (const row of rows) {
        const categoryName = row.category_name || "Unknown";

        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            name: categoryName,
            products: [],
          };
        }

        const mainImage = await compressAndEncodeBase64(row.main_image);

        categoryMap[categoryName].products.push({
          id: row.id,
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          main_image: mainImage ?? "", // Fallback to an empty string if null
          ratings: parseFloat(row.ratings),
          discount: parseFloat(row.discount),
          quantity: row.quantity,
          created_at: row.created_at,
          category_id: row.category_id,
        });
      }

      const categories = Object.values(categoryMap);

      // Update cache
      cache.set(cacheKey, {
        value: categories,
        expiry: Date.now() + CACHE_TTL,
      });

      return categories;
    } catch (error) {
      console.error("❌ Error fetching discounted products:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    }
  });
}
