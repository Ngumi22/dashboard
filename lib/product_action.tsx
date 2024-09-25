"use server";

import { getConnection } from "./db";
import { NextResponse } from "next/server";
import { FieldPacket, ResultSetHeader } from "mysql2/promise";
import validator from "validator";
import {
  createProductImages,
  createProductSupplierMapping,
  createSupplier,
  manageProductTags,
} from "./product_actions";

// Utility function to validate image files
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

// Create Product Function with improved handling
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

    // Validate required fields
    if (!name || !description || isNaN(price) || isNaN(stock)) {
      throw new CustomError("Missing or invalid product details.", 400);
    }

    // Validate and handle main image and thumbnails
    const mainImage = formData.get("mainImage") as File | null;
    const thumbnails = formData.getAll("thumbnails") as File[];

    // Set maximum file size (e.g., 2MB) and allowed types
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]; // Define allowed image types

    // Validate main image
    if (mainImage) {
      const { valid, message } = validateImageFile(
        mainImage,
        maxSize,
        allowedTypes
      );
      if (!valid) {
        throw new CustomError(message, 400);
      }
    }

    // Validate thumbnails
    if (thumbnails.length > 0) {
      for (const thumbnail of thumbnails) {
        const { valid, message } = validateImageFile(
          thumbnail as File,
          maxSize,
          allowedTypes
        );
        if (!valid) {
          throw new CustomError(message, 400);
        }
      }
    }

    // Insert product into database using prepared statements
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO products (name, description, price, stock, category_id, brand_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock, categoryId, brandId]
    );
    const productId = result.insertId;

    // Create a new FormData instance for images
    const imagesFormData = new FormData();
    if (mainImage) {
      imagesFormData.append("mainImage", mainImage);
    }
    thumbnails.forEach((thumbnail) => {
      imagesFormData.append("thumbnails", thumbnail);
    });

    // Handle tags and images asynchronously after product insert
    await Promise.all([
      createProductImages(imagesFormData, productId), // Handle images
      manageProductTags(formData, productId), // Manage tags
    ]);

    // Handle supplier and product-supplier mapping if supplierId is provided
    if (supplierId) {
      await createSupplier(formData); // Ensure supplier is created
      await createProductSupplierMapping(productId, supplierId); // Map product to supplier
    }

    // Commit transaction
    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      productId: productId,
    });
  } catch (error) {
    // Rollback transaction in case of error
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
    // Always release connection back to the pool
    connection.release();
  }
}
