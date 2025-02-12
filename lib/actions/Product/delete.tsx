"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { revalidatePath } from "next/cache";

export async function handleDeleteAction(product_id: number) {
  const productCacheKey = `product_${product_id}`;

  if (!product_id || product_id === 0) {
    throw new Error("Invalid product ID provided");
  }

  return dbOperation(async (connection) => {
    try {
      // Start transaction
      await connection.beginTransaction();

      // Step 1: Retrieve product details (category, brand, suppliers)
      const [productData]: [any[], any] = await connection.execute(
        `SELECT category_id, brand_id FROM products WHERE product_id = ?`,
        [product_id]
      );

      if (productData.length === 0) {
        throw new Error("Product not found");
      }

      // Step 3: Delete associated data
      await connection.execute(
        `DELETE FROM product_tags WHERE product_id = ?`,
        [product_id]
      );
      await connection.execute(
        `DELETE FROM product_specifications WHERE product_id = ?`,
        [product_id]
      );
      await connection.execute(
        `DELETE FROM product_reviews WHERE product_id = ?`,
        [product_id]
      );
      await connection.execute(
        `DELETE FROM product_suppliers WHERE product_id = ?`,
        [product_id]
      );
      await connection.execute(
        `DELETE FROM product_images WHERE product_id = ?`,
        [product_id]
      );

      // Step 4: Delete the product itself
      await connection.execute(`DELETE FROM products WHERE product_id = ?`, [
        product_id,
      ]);

      // Step 5: Invalidate product caches
      cache.delete(productCacheKey);
      // Cache invalidation
      cache.delete(productCacheKey);

      // Commit transaction
      await connection.commit();
      revalidatePath("/dashboard/products");
      return { message: "Product deleted successfully" };
    } catch (error: any) {
      // Rollback if any error occurs
      await connection.rollback();
      throw new Error(`Error deleting product: ${error.message}`);
    }
  });
}
