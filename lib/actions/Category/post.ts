"use server";

import { CategorySchema } from "@/lib/ZodSchemas/categorySchema";
import { fileToBuffer, getErrorMessage } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function CategorySubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  try {
    // console.log(data);
    // Validate form data using Zod schema
    const parsed = CategorySchema.safeParse({
      category_name: data.get("category_name"),
      category_description: data.get("category_description"),
      category_status: data.get("category_status"),
      category_image: data.get("category_image"),
      parent_category_id:
        data.get("parent_category_id") !== null
          ? parseInt(data.get("parent_category_id") as string, 10)
          : null, // Ensure parent_category_id is a number or null
    });

    // console.log("Parsed data:", parsed);

    if (!parsed.success) {
      console.error("Validation failed:", parsed.error.format());
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

    // Check if the category already exists
    const result = await dbOperation(async (connection) => {
      const [existingCategory]: any = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ? LIMIT 1",
        [parsed.data.category_name]
      );

      if (existingCategory.length > 0) {
        return {
          success: false,
          message: "Category already exists",
        };
      }

      // Convert the image to buffer
      const categoryImageBuffer = parsed.data.category_image
        ? await fileToBuffer(parsed.data.category_image as File)
        : null;

      // Insert new category with parent_category_id
      const [insertResult]: any = await connection.query(
        "INSERT INTO categories (category_name, category_image, category_description, category_status, parent_category_id) VALUES (?, ?, ?, ?, ?)",
        [
          parsed.data.category_name,
          categoryImageBuffer,
          parsed.data.category_description,
          parsed.data.category_status,
          parsed.data.parent_category_id || null, // Ensuring top-level categories are `null`
        ]
      );

      console.log("Inserted category with ID:", insertResult.insertId);

      return {
        success: true,
        message: "Category created successfully",
      };
    });

    if (!result.success) {
      return {
        message: result.message,
      };
    }

    return {
      message: "Category created successfully",
    };
  } catch (error) {
    console.error("Error in CategorySubmitAction:", error);
    return {
      message: "An error occurred while submitting the category",
      issues: [getErrorMessage(error)],
    };
  }
}
