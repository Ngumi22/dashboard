"use server";

import { CacheUtil } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function handleDeleteAction(product_id: number) {
  const productCacheKey = `product_${product_id}`;
  const allProductsCacheKey = `products`;

  if (!product_id || product_id === 0) {
    throw new Error("Invalid product ID provided");
  }

  return dbOperation(async (connection) => {
    // Step 1: Retrieve the product's category
    const [productData]: [any[], any] = await connection.execute(
      "SELECT category_id FROM products WHERE product_id = ?",
      [product_id]
    );

    if (productData.length === 0) {
      throw new Error("Product not found");
    }

    const { category_id } = productData[0];

    // Step 2: Delete associated tags
    await connection.execute("DELETE FROM product_tags WHERE product_id = ?", [
      product_id,
    ]);

    // Step 3: Delete the product
    await connection.execute("DELETE FROM products WHERE product_id = ?", [
      product_id,
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
      // Invalidate the category cache
      const categoryCacheKey = `category_${category_id}`;
      CacheUtil.delete(categoryCacheKey);
    }

    // Step 5: Delete unused product images
    const [imageExists]: [any[], any] = await connection.execute(
      "SELECT 1 FROM product_images WHERE product_id = ? LIMIT 1",
      [product_id]
    );

    if (imageExists.length === 0) {
      await connection.execute(
        "DELETE FROM product_images WHERE product_id = ?",
        [product_id]
      );
    }

    // Step 6: Invalidate caches using CacheUtil
    CacheUtil.delete(productCacheKey); // Remove the deleted product's cache
    CacheUtil.invalidate(allProductsCacheKey); // Invalidate allProducts cache to refresh the list

    return { message: "Product deleted successfully" };
  });
}
