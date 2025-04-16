"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { NewProductSchema } from "@/lib/ProductSchema";
import { fileToBuffer } from "@/lib/utils";
import { z } from "zod";

export type FormState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  timestamp?: number;
};

export async function addBrand(data: FormData, prevState: FormState) {
  const brandData = {
    brand_id: data.get("brand_id"),
    brand_name: data.get("brand_name"),
    brand_image: data.get("brand_image"),
  };

  return dbOperation(async (connection) => {
    try {
      if (brandData.brand_id) {
        const brandId = parseInt(brandData.brand_id as string, 10);

        if (isNaN(brandId)) {
          return {
            success: false,
            message: "Invalid brand_id provided",
            fieldErrors: undefined,
          };
        }

        const [existingBrand] = await connection.query(
          "SELECT brand_id FROM brands WHERE brand_id = ?",
          [brandId]
        );

        if (existingBrand.length === 0) {
          return {
            success: false,
            message: "Brand does not exist",
            fieldErrors: undefined,
          };
        }

        return {
          success: true,
          brandId: brandId,
        };
      }

      if (!brandData.brand_name || !brandData.brand_image) {
        return {
          success: false,
          message: "Brand name and image must be provided for a new brand",
          fieldErrors: undefined,
        };
      }

      const validatedData = NewProductSchema.pick({
        brand_name: true,
      }).parse(brandData);

      const brandImageBuffer = await fileToBuffer(
        brandData.brand_image as File
      );

      const [existingBrand] = await connection.query(
        "SELECT brand_id FROM brands WHERE brand_name = ?",
        [validatedData.brand_name]
      );

      if (existingBrand.length > 0) {
        return {
          success: true,
          brandId: existingBrand[0].brand_id,
        };
      }

      const [result] = await connection.query(
        "INSERT INTO brands (brand_name, brand_image) VALUES (?, ?)",
        [validatedData.brand_name, brandImageBuffer]
      );

      return {
        success: true,
        brandId: result.insertId,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(", ");

        return {
          success: false,
          message: `Validation error: ${errorMessages}`,
          fieldErrors: undefined,
        };
      }
      throw error;
    }
  });
}
