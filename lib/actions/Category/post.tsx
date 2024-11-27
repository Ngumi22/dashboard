"use server";
import { z } from "zod";

import { NextResponse } from "next/server";
import { CategorySchema } from "@/lib/ZodSchemas/categorySchema";
import { fileToBuffer, getErrorMessage, parseNumberField } from "@/lib/utils";
import { dbsetupTables } from "@/lib/MysqlTables";
import { getConnection } from "@/lib/database";

// Helper function for database operations

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

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function addCategory(formData: FormData) {
  const categoryData = {
    category_name: formData.get("category_name"),
    category_description: formData.get("category_description"),
    category_image: formData.get("category_image"), // Get the image from formData
    status: formData.get("status"),
  };

  try {
    // Validate the input data (excluding image for now)
    const validatedData = CategorySchema.pick({
      category_name: true,
      category_description: true,
      status: true,
    }).parse(categoryData);

    return dbOperation(async (connection) => {
      // Check if the category already exists
      const [existingCategory] = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [validatedData.category_name]
      );

      if (existingCategory.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Category already exists",
          categoryId: existingCategory[0].category_id,
        });
      }

      // Convert the image to buffer
      const categoryImageBuffer = await fileToBuffer(
        categoryData.category_image as File // Ensure correct type
      );

      // Insert the new category into the database
      const [result] = await connection.query(
        "INSERT INTO categories (category_name, category_image, category_description, status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)",
        [
          validatedData.category_name,
          categoryImageBuffer,
          validatedData.category_description,
          validatedData.status,
          parseNumberField(formData, "created_by"),
          parseNumberField(formData, "updated_by"),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Category created successfully",
        categoryId: result.insertId,
      });
    });
  } catch (error) {
    // Log the error for server-side visibility
    const errorMessage = getErrorMessage(error);
    console.error(`[Server Error in addCategory]: ${errorMessage}`);

    if (error instanceof z.ZodError) {
      // Handle validation errors
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          message: `Validation error: ${errorMessages}`,
        },
        { status: 400 }
      );
    }

    if (error instanceof CustomError) {
      // Handle custom errors (e.g., custom validation issues)
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the category",
      },
      { status: 500 }
    );
  }
}
