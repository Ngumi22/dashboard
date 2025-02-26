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
  created_at: string;
  category_id: string;
  brand_id: string;
};

export type ProductBrand = {
  name: string;
  products: Product[];
};

export async function fetchProductByBrand(
  brand_name: string
): Promise<ProductBrand | null> {
  const cacheKey = `brandProducts:${brand_name}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as ProductBrand;
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
            p.category_id,
            b.brand_name as brand_name,
            b.brand_id
        FROM
            brands b
        JOIN
            products p ON b.brand_id = p.brand_id
        LEFT JOIN
            product_images pi ON p.product_id = pi.product_id
        LEFT JOIN
            product_reviews pr ON p.product_id = pr.product_id
        WHERE
            b.brand_name = ?
            AND b.deleted_at IS NULL
        GROUP BY
            p.product_id, b.brand_name
        ORDER BY
            p.brand_id ASC`,
        [brand_name]
      );

      const rows = result[0] || [];

      // Convert images to Base64
      const products = await Promise.all(
        rows.map(async (row: any) => {
          const imageUrl = row.main_image;
          const base64Image = await compressAndEncodeBase64(imageUrl);

          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            main_image: base64Image, // Base64 string
            ratings: parseFloat(row.ratings),
            discount: parseFloat(row.discount),
            quantity: row.quantity,
            created_at: row.created_at,
            category_id: row.category_id,
            brand_id: row.brand_id,
          };
        })
      );

      const brand: ProductBrand = { name: brand_name, products };

      // Store in cache
      cache.set(cacheKey, {
        value: brand,
        expiry: Date.now() + 1000 * 60 * 5,
      });

      return brand;
    } catch (error: any) {
      console.error(`Error fetching products for brand ${brand_name}:`, error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  });
}
