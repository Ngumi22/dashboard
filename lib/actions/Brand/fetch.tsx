"use server";

import { CacheUtil } from "@/lib/cache"; // Import CacheUtil
import { Brand } from "./brandType";
import { compressAndEncodeBase64 } from "../utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueBrands() {
  const cacheKey = "brands";

  // Check if the result is already in the cache using CacheUtil
  const cachedData = CacheUtil.get<Brand[]>(cacheKey);
  if (cachedData) {
    return cachedData; // Return cached data if it exists
  }

  return await dbOperation(async (connection) => {
    // Fetch all unique brands
    const [brands] = await connection.query(`
      SELECT DISTINCT b.brand_id, b.brand_name, b.brand_image FROM brands b`);

    if (brands.length === 0) {
      return null; // Return null if no brands exist
    }

    // Map the result
    const uniquebrands: Brand[] = await Promise.all(
      brands.map(async (brand: any) => ({
        brand_id: brand.brand_id,
        brand_name: brand.brand_name,
        brand_image: brand.brand_image
          ? await compressAndEncodeBase64(brand.brand_image)
          : null, // Compress image if it exists
      }))
    );

    // Cache the result with an expiry time using CacheUtil
    CacheUtil.set(cacheKey, uniquebrands, 3600); // Cache for 1 hour (3600 seconds)

    return uniquebrands;
  });
}

export async function fetchBrandById(brand_id: number) {
  const cacheKey = `brand_${brand_id}`;

  // Check if the result is already in the cache using CacheUtil
  const cachedData = CacheUtil.get<Brand>(cacheKey);
  if (cachedData) {
    return cachedData; // Return cached data if it exists
  }

  return await dbOperation(async (connection) => {
    try {
      // Query the database
      const [rows] = await connection.query(
        `SELECT brand_id, brand_name, brand_image FROM brands WHERE brand_id = ?`,
        [brand_id]
      );

      // If no rows are returned, return null
      if (rows.length === 0) {
        return null;
      }

      // Map database results to a brand object
      const brand = {
        brand_id: rows[0].brand_id,
        brand_name: rows[0].brand_name,
        brand_image: rows[0].brand_image
          ? await compressAndEncodeBase64(rows[0].brand_image)
          : null, // Compress image if it exists
      };

      // Cache the result with an expiry time using CacheUtil
      CacheUtil.set(cacheKey, brand, 60); // Cache for 1 minute (60 seconds)

      return brand;
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Failed to fetch brand");
    }
  });
}
