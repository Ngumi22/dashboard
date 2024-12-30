"use server";

import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";
import { cache, setCache } from "@/lib/cache";
import { Brand } from "./brandType";
import { compressAndEncodeBase64 } from "../Product/productTypes";

export async function getUniqueBrands() {
  const cacheKey = "unique_brands";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch all unique brands
    const [brands] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT b.brand_id, b.brand_name, b.brand_image FROM brands b`);

    if (brands.length === 0) {
      return null; // Return null if no brands exists
    }

    // Map the result
    const uniquebrands: Brand[] = await Promise.all(
      brands.map(async (brand) => ({
        brand_id: brand.brand_id,
        brand_name: brand.brand_name,
        brand_image: brand.brand_image
          ? await compressAndEncodeBase64(brand.brand_image)
          : null, // Compress image if it exists
      }))
    );

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniquebrands,
      expiry: Date.now() + 36 * 10, // 1 hour expiration
    });

    return uniquebrands;
  } catch (error) {
    console.error("Error fetching unique brands:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchBrandById(brand_id: number) {
  const cacheKey = `brand_${brand_id}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Query the database
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT brand_id, brand_name, brand_image FROM brands WHERE brand_id = ?`,
      [brand_id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      return null;
    }

    // Map database results to a brand object
    const brand: Brand = {
      brand_id: rows[0].brand_id,
      brand_name: rows[0].brand_name,
      brand_image: rows[0].brand_image
        ? await compressAndEncodeBase64(rows[0].brand_image)
        : null, // Compress image if it exists
    };

    setCache(cacheKey, brand, { ttl: 60 }); // Cache for 1 minutes

    return brand;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch brand");
  } finally {
    connection.release();
  }
}
