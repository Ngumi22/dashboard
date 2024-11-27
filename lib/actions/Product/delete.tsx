"use server";

import { getConnection } from "@/lib/database";
import { cache } from "@/lib/cache";
import { dbsetupTables } from "@/lib/MysqlTables";
import { getErrorMessage } from "@/lib/utils";

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

    throw new Error(errorMessage); // Re-throw for handling in API routes
  } finally {
    connection.release();
  }
}

export async function handleDeleteAction(productId: number) {
  if (!productId || productId === 0) {
    throw new Error("Invalid product ID provided");
  }

  return dbOperation(async (connection) => {
    // Step 1: Retrieve the product's category
    const [productData]: [any[], any] = await connection.execute(
      "SELECT category_id FROM products WHERE product_id = ?",
      [productId]
    );

    if (productData.length === 0) {
      throw new Error("Product not found");
    }

    const { category_id } = productData[0];

    // Step 2: Delete associated tags
    await connection.execute("DELETE FROM product_tags WHERE product_id = ?", [
      productId,
    ]);

    // Step 3: Delete the product
    await connection.execute("DELETE FROM products WHERE product_id = ?", [
      productId,
    ]);

    // Step 4: Delete the category if no remaining products exist
    const [remainingProducts]: [any[], any] = await connection.execute(
      "SELECT 1 FROM products WHERE category_id = ? LIMIT 1",
      [category_id]
    );

    if (remainingProducts.length === 0) {
      await connection.execute("DELETE FROM categories WHERE category_id = ?", [
        category_id,
      ]);
    }

    // Step 5: Delete unused product images
    const [imageExists]: [any[], any] = await connection.execute(
      "SELECT 1 FROM product_images WHERE product_id = ? LIMIT 1",
      [productId]
    );

    if (imageExists.length === 0) {
      await connection.execute(
        "DELETE FROM product_images WHERE product_id = ?",
        [productId]
      );
    }

    // Invalidate cache for the deleted product
    const productCacheKey = `product_${productId}`;
    cache.delete(productCacheKey);

    // Invalidate cache for all products
    const allProductsCacheKey = `all_products`;
    cache.delete(allProductsCacheKey);

    // Invalidate cache for related category if no products remain
    const categoryCacheKey = `category_${category_id}`;
    cache.delete(categoryCacheKey);

    return { message: "Product deleted successfully" };
  });
}
