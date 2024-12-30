"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { NewProductSchema } from "@/lib/ProductSchema";
import { fileToBuffer, parseNumberField } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function addBrand(data: FormData) {
  const brandData = {
    brand_id: data.get("brand_id"),
    brand_name: data.get("brand_name"),
    brand_image: data.get("brand_image"),
  };

  try {
    if (brandData.brand_id) {
      const brandId = parseInt(brandData.brand_id as string, 10);
      if (isNaN(brandId)) {
        throw new CustomError("Invalid brand_id provided", 400);
      }

      return dbOperation(async (connection) => {
        const [existingBrand] = await connection.query(
          "SELECT brand_id FROM brands WHERE brand_id = ?",
          [brandId]
        );

        if (existingBrand.length === 0) {
          throw new CustomError("Brand does not exist", 404);
        }

        return {
          success: true,
          brandId: brandId,
        };
      });
    }

    if (!brandData.brand_name || !brandData.brand_image) {
      throw new CustomError(
        "Brand name and image must be provided for a new brand",
        400
      );
    }

    const validatedData = NewProductSchema.pick({
      brand_name: true,
    }).parse(brandData);

    const brandImageBuffer = await fileToBuffer(brandData.brand_image as File);

    return dbOperation(async (connection) => {
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
        "INSERT INTO brands (brand_name, brand_image, created_by, updated_by) VALUES (?, ?, null, null)",
        [validatedData.brand_name, brandImageBuffer]
      );

      return {
        success: true,
        brandId: result.insertId,
      };
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new CustomError(`Validation error: ${errorMessages}`, 400);
    }
    throw error;
  }
}
