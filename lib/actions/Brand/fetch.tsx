"use server";

import { cache, CacheUtil } from "@/lib/cache"; // Import CacheUtil
import { Brand } from "./brandType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export async function getUniqueBrands(): Promise<Brand[]> {
  const cacheKey = "brandData";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Brand[]; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    // Fetch all unique brands
    const [brands] = await connection.query(`
      SELECT DISTINCT b.brand_id, b.brand_name, b.brand_image FROM brands b`);

    // Return an empty array if no brands found
    if (!brands || brands.length === 0) {
      cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
      return [];
    }

    // Map the result
    const uniqueBrands: Brand[] = await Promise.all(
      brands.map(async (brand: any) => ({
        brand_id: brand.brand_id,
        brand_name: brand.brand_name,
        brand_image: brand.brand_image
          ? await compressAndEncodeBase64(brand.brand_image)
          : null, // Compress image if it exists
      }))
    );

    cache.set(cacheKey, {
      value: uniqueBrands,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });
    return uniqueBrands;
  });
}

export async function fetchBrandById(brand_id: number): Promise<Brand | null> {
  const cacheKey = `brand_${brand_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Brand; // Return cached data as Banner
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      // Query the database
      const [rows] = await connection.query(
        `SELECT brand_id, brand_name, brand_image FROM brands WHERE brand_id = ?`,
        [brand_id]
      );

      if (!rows || rows.length === 0) {
        return null; // Return null if no banner is found
      }

      // Map database results to a brand object
      const brand = rows[0];
      const processedBrand: any = {
        brand_id: brand.brand_id,
        brand_name: brand.brand_name,
        brand_image: brand.brand_image
          ? await compressAndEncodeBase64(brand.brand_image)
          : null, // Compress image if it exists
      };

      cache.set(cacheKey, {
        value: processedBrand,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return processedBrand;
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Failed to fetch brand");
    }
  });
}
