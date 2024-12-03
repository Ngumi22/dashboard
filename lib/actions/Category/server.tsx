"use server";

import { CategorySchema } from "@/lib/ZodSchemas/categorySchema";
import { fileToBuffer, getErrorMessage, parseNumberField } from "@/lib/utils";
import { getConnection } from "@/lib/database";
import { dbsetupTables } from "@/lib/MysqlTables";
import sharp from "sharp";
import { cache } from "@/lib/cache";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function dbOperation<T>(
  operation: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    await dbsetupTables();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();

    const errorMessage = getErrorMessage(error);

    // Log the error to the server console
    console.error(`[Server Error]: ${errorMessage}`);

    // Optionally, send the error to a monitoring service like Sentry
    // Sentry.captureException(error);

    throw new Error(errorMessage); // Re-throw for handling in API routes
  } finally {
    connection.release();
  }
}

// Compress image utility
async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    // Validate buffer by ensuring it's an image
    const isValidImage = await sharp(buffer).metadata(); // This will throw if it's not an image

    const compressedBuffer = await sharp(buffer)
      .resize(100) // Resize to 100px width
      .webp({ quality: 70 }) // Convert to WebP with 70% quality
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error (invalid buffer):", error);
    return null;
  }
}

export async function CategorySubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const uniqueCategoriesCacheKey = "unique_categories";

  try {
    // Validate form data using Zod schema
    const parsed = CategorySchema.safeParse({
      category_name: data.get("category_name"),
      category_description: data.get("category_description"),
      status: data.get("status"),
      category_image: data.get("category_image"), // Get the image from data
    });

    if (!parsed.success) {
      const fields: Record<string, string> = {};
      data.forEach((value, key) => {
        fields[key] = value.toString();
      });
      return {
        message: "Invalid form data",
        fields,
        issues: parsed.error.issues.map((issue) => issue.message),
      };
    }

    // Perform the database operation
    const result = await dbOperation(async (connection) => {
      // Check if the category already exists
      const [existingCategory]: any[] = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [parsed.data.category_name]
      );

      if (existingCategory.length > 0) {
        return {
          success: false,
          message: "Category already exists",
          fields: {
            category_name: parsed.data.category_name,
            category_description: parsed.data.category_description,
          },
        };
      }

      // Convert the image to buffer
      const categoryImageBuffer = data.get("category_image")
        ? await fileToBuffer(data.get("category_image") as File)
        : null;

      // Insert new category
      const [insertResult]: any = await connection.query(
        "INSERT INTO categories (category_name, category_image, category_description, status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)",
        [
          parsed.data.category_name,
          categoryImageBuffer,
          parsed.data.category_description,
          parsed.data.status,
          parseNumberField(data, "created_by"),
          parseNumberField(data, "updated_by"),
        ]
      );

      return {
        success: true,
        message: "Category created successfully",
        categoryId: insertResult.insertId,
        fields: {
          category_name: parsed.data.category_name,
          category_description: parsed.data.category_description,
        },
      };
    });

    if (result.success) {
      // Invalidate the global categories cache
      cache.delete(uniqueCategoriesCacheKey);
    }

    return {
      message: result.message,
      fields: result.fields,
    };
  } catch (error) {
    console.error("Error in CategorySubmitAction:", error);
    return {
      message: "An error occurred while submitting the category",
      issues: [getErrorMessage(error)],
    };
  }
}

export async function updateCategoryAction(
  category_id: string,
  formData: FormData
) {
  const uniqueCategoriesCacheKey = "unique_categories";
  const categoryCacheKey = `category_${category_id}`;

  const connection = await getConnection();
  try {
    const categoryName = formData.get("category_name");
    const categoryDescription = formData.get("category_description");
    const status = formData.get("status");
    const categoryImageBuffer = formData.get("category_image")
      ? await fileToBuffer(formData.get("category_image") as File)
      : null;
    const existingImage = formData.get("existing_image");

    const query = `
      UPDATE categories
      SET
        category_name = COALESCE(?, category_name),
        category_image = COALESCE(?, ?), -- Use new image or keep existing
        category_description = COALESCE(?, category_description),
        status = COALESCE(?, status)
      WHERE category_id = ?;
    `;

    const values = [
      categoryName,
      categoryImageBuffer, // New image buffer
      existingImage, // Fallback to existing image
      categoryDescription,
      status,
      category_id,
    ];

    const [result]: [any, any] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error("Category not found or no changes made");
    }

    // Invalidate the category-specific cache
    cache.delete(categoryCacheKey);

    // Invalidate the global categories cache
    cache.delete(uniqueCategoriesCacheKey);

    return { success: true, message: "Category updated successfully" };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error.message || "Failed to update category",
    };
  } finally {
    connection.release();
  }
}
