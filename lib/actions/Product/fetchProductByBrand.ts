"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

// Define your types
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
  brand_id: string;
};

export type ProductBrand = {
  name: string;
  products: MinimalProduct[];
};

// Define the raw row type from the database
type RawProductRow = {
  brand_id: string;
  brand_name: string;
  id: number;
  name: string;
  description: string;
  price: string;
  created_at: string;
  main_image: string;
  ratings: string;
  discount: string;
  quantity: number;
  category_id: string;
};

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function fetchProductsGroupedByBrand(): Promise<ProductBrand[]> {
  const cacheKey = `allBrandProducts`;

  // Check cache first with proper typing
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() < cachedData.expiry) {
    return cachedData.value;
  }

  // Add proper typing to the dbOperation callback
  return dbOperation(async (connection) => {
    try {
      const [rows] = await connection.query(`
        SELECT
          b.brand_id,
          b.brand_name,
          p.product_id AS id,
          p.product_name AS name,
          p.product_description AS description,
          p.product_price AS price,
          DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
          MAX(pi.main_image) AS main_image,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          p.product_discount AS discount,
          p.product_quantity AS quantity,
          p.category_id
        FROM
          brands b
        JOIN
          products p ON b.brand_id = p.brand_id
        LEFT JOIN
          product_images pi ON p.product_id = pi.product_id
        LEFT JOIN
          product_reviews pr ON p.product_id = pr.product_id
        WHERE
          b.deleted_at IS NULL
          AND p.product_status = 'approved'
        GROUP BY
          b.brand_id, b.brand_name, p.product_id
        ORDER BY
          b.brand_name, p.product_id;
      `);

      // Process images in parallel with proper typing
      const processedProducts = await Promise.all(
        rows.map(async (row: any) => {
          const imageUrl = row.main_image;
          const base64Image = await compressAndEncodeBase64(imageUrl);

          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            main_image: base64Image ?? "",
            ratings: parseFloat(row.ratings),
            discount: parseFloat(row.discount),
            quantity: row.quantity,
            created_at: row.created_at,
            category_id: row.category_id,
            brand_id: row.brand_id,
          };
        })
      );

      // Group by brand with proper typing
      const brandMap = processedProducts.reduce<Record<string, ProductBrand>>(
        (acc, product) => {
          const brandName =
            rows.find((r: RawProductRow) => r.id === product.id)?.brand_name ||
            "Unknown";
          if (!acc[brandName]) {
            acc[brandName] = { name: brandName, products: [] };
          }
          acc[brandName].products.push(product);
          return acc;
        },
        {}
      );

      const brands = Object.values(brandMap);

      // Update cache with proper typing
      cache.set(cacheKey, {
        value: brands,
        expiry: Date.now() + CACHE_TTL,
      });

      return brands;
    } catch (error) {
      console.error(`Error fetching brands with products:`, error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch brand products"
      );
    }
  });
}
