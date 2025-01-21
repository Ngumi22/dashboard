"use server";

import { CategorySchema } from "@/lib/ZodSchemas/categorySchema";
import { fileToBuffer, getErrorMessage } from "@/lib/utils";
import { cache } from "@/lib/cache";
import { getConnection } from "@/lib/MysqlDB/initDb";
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
  const uniqueCategoriesCacheKey = "categoriesData";

  try {
    // Validate form data using Zod schema
    const parsed = CategorySchema.safeParse({
      category_name: data.get("category_name"),
      category_description: data.get("category_description"),
      category_status: data.get("category_status"),
      category_image: data.get("category_image"),
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

    // Check if the category already exists in the database
    const result = await dbOperation(async (connection) => {
      const [existingCategory]: any[] = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ? LIMIT 1",
        [parsed.data.category_name]
      );

      if (existingCategory.length > 0) {
        return {
          success: false,
          message: `Category already exists`,
        };
      }

      // Convert the image to buffer
      const categoryImageBuffer = data.get("category_image")
        ? await fileToBuffer(data.get("category_image") as File)
        : null;

      // Insert new category
      const [insertResult]: any = await connection.query(
        "INSERT INTO categories (category_name, category_image, category_description, category_status) VALUES (?, ?, ?, ?)",
        [
          parsed.data.category_name,
          categoryImageBuffer,
          parsed.data.category_description,
          parsed.data.category_status,
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

    // Invalidate the categories cache if applicable
    cache.delete(uniqueCategoriesCacheKey);

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

export async function updateCategoryAction(
  category_id: string,
  formData: FormData
) {
  const uniqueCategoriesCacheKey = "categoriesData";
  const categoryCacheKey = `category_${category_id}`;

  const connection = await getConnection();
  try {
    const categoryName = formData.get("category_name");
    const categoryDescription = formData.get("category_description");
    const categoryStatus = formData.get("category_status");
    const newImageFile = formData.get("category_image");

    const updates: string[] = [];
    const values: any[] = [];

    if (categoryName) {
      updates.push("category_name = ?");
      values.push(categoryName);
    }

    if (categoryDescription) {
      updates.push("category_description = ?");
      values.push(categoryDescription);
    }

    if (categoryStatus) {
      updates.push("category_status = ?");
      values.push(categoryStatus);
    }

    if (newImageFile) {
      const newImageBuffer = await fileToBuffer(newImageFile as File);
      updates.push("category_image = ?");
      values.push(newImageBuffer);
    }

    // Ensure we have fields to update
    if (updates.length === 0) {
      return { success: false, message: "No fields to update." };
    }

    updates.push("updated_at = NOW()");
    const query = `
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE category_id = ?;
    `;
    values.push(category_id);

    const [result]: [any, any] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error("Failed to update category. Category might not exist.");
    }

    // Clear caches
    cache.delete(categoryCacheKey);
    cache.delete(uniqueCategoriesCacheKey);

    return { success: true, message: "Category updated successfully." };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error.message || "Failed to update category.",
    };
  } finally {
    connection.release();
  }
}
