"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export async function deleteCategory(category_id: number) {
  return await dbOperation(async (connection) => {
    // Check if the category exists and whether it's a parent category
    const [categoryRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.execute(
        "SELECT category_id, parent_category_id FROM categories WHERE category_id = ? FOR UPDATE",
        [category_id]
      );

    if (categoryRows.length === 0) {
      return { success: false, error: "Category not found" };
    }

    const isParentCategory = categoryRows[0].parent_category_id === null;

    if (isParentCategory) {
      // Delete all subcategories first before deleting the parent category
      await connection.execute(
        "DELETE FROM categories WHERE parent_category_id = ?",
        [category_id]
      );
    }

    // Delete the category itself
    const [result]: [any, FieldPacket[]] = await connection.execute(
      "DELETE FROM categories WHERE category_id = ?",
      [category_id]
    );

    if (result.affectedRows === 0) {
      return { success: false, error: "Failed to delete category" };
    }

    return {
      success: true,
      message: "Category and its subcategories deleted successfully",
    };
  });
}
