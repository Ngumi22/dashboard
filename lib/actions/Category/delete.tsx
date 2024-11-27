import { cache } from "@/lib/cache";
import { getConnection } from "@/lib/database";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";

export async function deleteCategory(
  category_id: string
): Promise<NextResponse> {
  const cacheKey = `category_${category_id}`;
  const connection = await getConnection();

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Check if the category exists
    const [categoryRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.execute(
        "SELECT category_id FROM categories WHERE category_id = ? FOR UPDATE",
        [category_id]
      );

    if (categoryRows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete the category (products will be deleted automatically due to ON DELETE CASCADE)
    const [result] = await connection.execute(
      `DELETE FROM categories WHERE category_id = ?`,
      [category_id]
    );

    // If no rows were deleted, the category does not exist
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Remove from cache to ensure it does not contain stale data
    cache.delete(cacheKey);

    // Commit the transaction
    await connection.commit();

    return NextResponse.json(
      { message: "Category and associated products deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);

    // Rollback the transaction in case of error
    await connection.rollback();

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  } finally {
    // Release the connection
    connection.release();
  }
}
