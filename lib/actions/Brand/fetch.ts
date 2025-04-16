"use server";

import { Brand } from "./brandType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export async function getUniqueBrands(): Promise<Brand[]> {
  return await dbOperation(async (connection) => {
    const [brands] = await connection.query(`
      SELECT DISTINCT b.brand_id, b.brand_name, b.brand_image FROM brands b
    `);

    if (!brands || brands.length === 0) return [];

    return await Promise.all(
      brands.map(async (brand: any) => ({
        brand_id: brand.brand_id,
        brand_name: brand.brand_name,
        brand_image: brand.brand_image
          ? await compressAndEncodeBase64(brand.brand_image)
          : null,
      }))
    );
  });
}

export async function fetchBrandById(brand_id: number): Promise<Brand | null> {
  return await dbOperation(async (connection) => {
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

    return processedBrand;
  });
}
