"use server";

import { fileToBuffer } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function updateCategoryAction(
  category_id: string,
  formData: FormData
) {
  return dbOperation(async (connection) => {
    try {
      const categoryName = formData.get("category_name");
      const categoryDescription = formData.get("category_description");
      const categoryStatus = formData.get("category_status");
      const newImageFile = formData.get("category_image");
      const parentCategoryId =
        formData.get("parent_category_id") !== null
          ? parseInt(formData.get("parent_category_id") as string, 10)
          : null; // Ensure it's a number or null

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

      if (parentCategoryId !== null) {
        updates.push("parent_category_id = ?");
        values.push(parentCategoryId);
      }

      // Ensure we have fields to update
      if (updates.length === 0) {
        return { success: false, message: "No fields to update." };
      }

      updates.push("updated_at = NOW()");
      values.push(category_id);

      const query = `UPDATE categories SET ${updates.join(
        ", "
      )} WHERE category_id = ?`;

      const [result]: [any, any] = await connection.execute(query, values);

      if (result.affectedRows === 0) {
        throw new Error("Failed to update category. Category might not exist.");
      }

      return { success: true, message: "Category updated successfully." };
    } catch (error: any) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: error.message || "Failed to update category.",
      };
    }
  });
}
