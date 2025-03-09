"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export interface Specification {
  specification_id: number;
  specification_name: string;
}

export interface ProductSpecification {
  specification_id: number;
  specification_name: string;
  product_id: number;
  specification_value: string;
  category_id: number;
}

export async function getSpecificationsForProduct(productId: string) {
  if (!productId) {
    console.error("Invalid product ID:", productId);
    return [];
  }

  try {
    const specifications = await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        `SELECT s.specification_id, s.specification_name
         FROM specifications s
         JOIN category_specifications cs ON s.specification_id = cs.specification_id
         JOIN products p ON cs.category_id = p.category_id
         WHERE p.product_id = ?`,
        [productId]
      );

      return rows;
    });

    return specifications;
  } catch (error) {
    console.error("Failed to fetch specifications:", error);
    return [];
  }
}

export async function getProductSpecifications(
  product_id: number
): Promise<ProductSpecification[]> {
  const cacheKey = `Specifications_${product_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as ProductSpecification[]; // Return cached data as Banner
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      const [rows] = await connection.query(
        `SELECT
          s.specification_id,
            s.specification_name,
            ps.value AS specification_value,
            cs.category_id,
            ps.product_id
        FROM
            product_specifications ps
        JOIN
            specifications s ON ps.specification_id = s.specification_id
        JOIN
            category_specifications cs ON s.specification_id = cs.specification_id
        WHERE
            ps.product_id = ?`,
        [product_id]
      );

      // Return an empty array if no rows found
      if (!rows || rows.length === 0) {
        cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
        return [];
      }

      const specifications: ProductSpecification[] = await Promise.all(
        rows.map(async (row: any) => ({
          product_id: row.product_id,
          specification_name: row.specification_name,
          specification_value: row.specification_value,
        }))
      );

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: specifications,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return specifications;
    } catch (error) {
      console.error("Failed to fetch product specifications:", error);
      return [];
    }
  });
}
