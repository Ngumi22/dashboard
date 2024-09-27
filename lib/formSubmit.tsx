"use server";

import { getConnection } from "./database";
import { FormSchema } from "./formSchema";
import { dbsetupTables } from "./MysqlTables";
import {
  createProductImages,
  createProductSupplierMapping,
  createSupplier,
  manageProductTags,
} from "./product_actions";
import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import validator from "validator";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

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

// Create Product Function accepting prevState and formData
export async function onSubmitAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const connection = await getConnection();

  try {
    console.log("Starting transaction...");
    await connection.beginTransaction();

    // Ensure tables exist
    await dbsetupTables();
    console.log("Tables checked/created.");

    // Convert FormData to a regular object for validation
    const formDataObject = Object.fromEntries(formData.entries());

    // Validate the form data using Zod
    const parsed = FormSchema.safeParse(formDataObject);

    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formDataObject)) {
        fields[key] = formDataObject[key].toString();
      }
      return {
        message: "Invalid form data",
        fields,
        issues: parsed.error.issues.map((issue) => issue.message),
      };
    }

    // Extract validated data
    const {
      name,
      description,
      price,
      quantity,
      categoryId,
      brandId,
      supplierId,
    } = parsed.data;

    const mainImageFile = formData.get("mainImage") as File | null;
    const thumbnailsFiles = formData.getAll("thumbnails") as File[];

    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    // Validate main image
    if (mainImageFile) {
      const { valid, message } = validateImageFile(
        mainImageFile,
        maxSize,
        allowedTypes
      );
      if (!valid)
        return { message, fields: { mainImage: message }, issues: [message] };
    }

    // Validate thumbnails
    for (const thumbnail of thumbnailsFiles) {
      const { valid, message } = validateImageFile(
        thumbnail,
        maxSize,
        allowedTypes
      );
      if (!valid)
        return { message, fields: { thumbnails: message }, issues: [message] };
    }

    // Insert product into the database
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO products (name, description, price, stock, category_id, brand_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, quantity, categoryId, brandId]
    );

    const productId = result.insertId;

    const imagesFormData = new FormData();
    if (mainImageFile) imagesFormData.append("mainImage", mainImageFile);
    thumbnailsFiles.forEach((thumbnail) =>
      imagesFormData.append("thumbnails", thumbnail)
    );

    // Manage images and tags
    await Promise.all([
      createProductImages(imagesFormData, productId),
      manageProductTags(formData, productId),
    ]);

    // Create supplier mapping if supplierId is provided
    if (supplierId) {
      await createProductSupplierMapping(productId, supplierId);
    }

    await connection.commit();
    return { message: "Product created successfully." };
  } catch (error) {
    await connection.rollback();
    logError(error, "Error creating product");
    return {
      message: "An unexpected error occurred while creating the product.",
    };
  } finally {
    connection.release();
  }
}
