"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export async function deleteCategory(category_id: string) {
  const categoryCacheKey = `category_${category_id}`;
  const uniqueCategoriesCacheKey = "categories";

  return await dbOperation(async (connection) => {
    // Check if the category exists
    const [categoryRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.execute(
        "SELECT category_id FROM categories WHERE category_id = ? FOR UPDATE",
        [category_id]
      );

    if (categoryRows.length === 0) {
      return { success: false, error: "Category not found" };
    }

    // Delete the category
    const [result]: [any, FieldPacket[]] = await connection.execute(
      "DELETE FROM categories WHERE category_id = ?",
      [category_id]
    );

    if (result.affectedRows === 0) {
      return { success: false, error: "Failed to delete category" };
    }

    // Invalidate caches
    cache.delete(categoryCacheKey); // Remove specific category from cache
    cache.delete(uniqueCategoriesCacheKey); // Invalidate entire categories list cache

    return { success: true, message: "Category deleted successfully" };
  });
}
