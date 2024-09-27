"use server";

import { getConnection } from "./database";
import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import {
  createProductImages,
  createProductSupplierMapping,
  createSupplier,
  manageProductTags,
} from "./product_actions";
import validator from "validator";

// Custom error class for improved error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Utility function for centralized logging
function logError(error: any, message: string) {
  console.error(`${message}:`, error);
}

// Improved validateImageFile with dynamic maxSize in error message
function validateImageFile(
  file: File,
  maxSize: number,
  allowedTypes: string[]
): { valid: boolean; message: string } {
  if (file.size > maxSize || !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File must be less than ${
        maxSize / 1024
      }KB and in allowed formats: ${allowedTypes.join(", ")}.`,
    };
  }
  return { valid: true, message: "File is valid." };
}

// Create Product Function with refined supplier handling
export async function createProduct(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and validate product details
    const name = validator.escape(formData.get("name") as string);
    const description = validator.escape(formData.get("description") as string);
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const categoryId = parseInt(formData.get("category_id") as string, 10);
    const brandId = parseInt(formData.get("brand_id") as string, 10);
    const supplierId = formData.get("supplier_id")
      ? parseInt(formData.get("supplier_id") as string, 10)
      : null;

    if (!name || !description || isNaN(price) || isNaN(stock)) {
      throw new CustomError("Missing or invalid product details.", 400);
    }

    const mainImage = formData.get("mainImage") as File | null;
    const thumbnails = formData.getAll("thumbnails") as File[];

    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (mainImage) {
      const { valid, message } = validateImageFile(
        mainImage,
        maxSize,
        allowedTypes
      );
      if (!valid) throw new CustomError(message, 400);
    }

    if (thumbnails.length > 0) {
      for (const thumbnail of thumbnails) {
        const { valid, message } = validateImageFile(
          thumbnail,
          maxSize,
          allowedTypes
        );
        if (!valid) throw new CustomError(message, 400);
      }
    }

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO products (name, description, price, stock, category_id, brand_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock, categoryId, brandId]
    );

    const productId = result.insertId;

    const imagesFormData = new FormData();
    if (mainImage) imagesFormData.append("mainImage", mainImage);
    thumbnails.forEach((thumbnail) =>
      imagesFormData.append("thumbnails", thumbnail)
    );

    await Promise.all([
      createProductImages(imagesFormData, productId),
      manageProductTags(formData, productId),
    ]);

    if (supplierId) {
      await createProductSupplierMapping(productId, supplierId);
    }

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      productId: productId,
    });
  } catch (error) {
    await connection.rollback();
    logError(error, "Error creating product");

    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while creating the product.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
