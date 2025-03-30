"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string; // Base64 encoded
  ratings: number;
  discount: number;
  quantity: number;
  product_status: "approved" | "draft" | "pending";
  created_at: string;
  category_id: string;
  tag_name: string; // Added to match the expected structure
};

export type ProductTags = {
  name: string;
  products: Product[];
};

export async function fetchProductsByTag(
  tag_name: string
): Promise<ProductTags | null> {
  const cacheKey = `tagProducts:${tag_name}`; // Include tag_name in cache key

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as ProductTags;
    }
    cache.delete(cacheKey); // Remove expired cache
  }

  return dbOperation(async (connection) => {
    try {
      const result = await connection.query(
        `SELECT
            p.product_id AS id,
            p.product_name AS name,
            p.product_description AS description,
            p.product_price AS price,
            DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
            MAX(pi.main_image) AS main_image,
            COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
            p.product_discount AS discount,
            p.product_quantity AS quantity,
            p.product_status,
            c.category_id AS category_id, -- Return category ID
            c.category_name AS category_name, -- Return category name
            t.tag_name AS tag_name -- Return tag name
        FROM
            products p
        LEFT JOIN
            product_images pi ON p.product_id = pi.product_id
        LEFT JOIN
            product_reviews pr ON p.product_id = pr.product_id
        LEFT JOIN
            product_tags pt ON p.product_id = pt.product_id
        LEFT JOIN
            tags t ON pt.tag_id = t.tag_id
        LEFT JOIN
            categories c ON p.category_id = c.category_id -- Join to get category name
        WHERE
            t.tag_name = ?
            AND p.product_status = 'approved'
        GROUP BY
            p.product_id
        ORDER BY
            p.product_name ASC;`,
        [tag_name]
      );

      const rows = result[0] || [];

      // Convert images to Base64
      const products = await Promise.all(
        rows.map(async (row: any) => {
          const imageUrl = row.main_image;
          const base64Image = imageUrl
            ? await compressAndEncodeBase64(imageUrl)
            : null;
          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            main_image: base64Image, // Base64 string or null
            ratings: parseFloat(row.ratings),
            discount: parseFloat(row.discount),
            quantity: row.quantity,
            created_at: row.created_at,
            category_id: row.category_id,
            product_status: row.product_status,
            tag_name: row.tag_name, // Include tag_name in the product object
          };
        })
      );

      const tag: ProductTags = { name: tag_name, products };

      // Store in cache
      cache.set(cacheKey, {
        value: tag,
        expiry: Date.now() + 1000 * 60 * 5, // Cache for 5 minutes
      });

      return tag;
    } catch (error: any) {
      console.error(`Error fetching products for tag ${tag_name}:`, error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  });
}
