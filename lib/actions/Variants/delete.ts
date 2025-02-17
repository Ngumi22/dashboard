"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { revalidatePath } from "next/cache";

export async function deleteVariant(variantId: number, productId: number) {
  if (!variantId || !productId)
    return { error: "Invalid variant or product ID" };

  try {
    const result = await dbOperation(async (connection) => {
      await connection.beginTransaction();

      // Soft delete variant
      await connection.query(
        `UPDATE variants SET deleted_at = NOW() WHERE variant_id = ?`,
        [variantId]
      );

      await connection.commit();
      return { success: true };
    });

    revalidatePath(`/dashboard/products/${productId}/variants`);
    return result;
  } catch (error) {
    console.error("Error deleting variant:", error);
    return { error: "Failed to delete variant" };
  }
}
