"use server";

import { CacheUtil } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { revalidatePath } from "next/cache";

export async function updateProduct(product_id: string, formData: FormData) {
  if (!product_id || !formData) {
    throw new Error("Invalid product ID or form data");
  }

  const cacheKey = `product_${product_id}`;
  const allProductsCacheKey = `products`;

  return dbOperation(async (connection) => {
    // Parse data from FormData
    const productName = formData.get("product_name") as string | null;
    const productSku = formData.get("product_sku") as string | null;
    const productDescription = formData.get("product_description") as
      | string
      | null;
    const productPrice =
      parseFloat(formData.get("product_price") as string) || null;
    const productDiscount =
      parseFloat(formData.get("product_discount") as string) || null;
    const productQuantity =
      parseInt(formData.get("product_quantity") as string) || null;
    const productStatus = formData.get("product_status") as string | null;
    const categoryId = formData.get("category_id") as string | null;
    const brandId = formData.get("brand_id") as string | null;
    const updatedBy = formData.get("updated_by") as string | null;

    // Prepare the SQL query for updating the product
    const query = `
      UPDATE products
      SET
        product_name = COALESCE(?, product_name),
        product_sku = COALESCE(?, product_sku),
        product_description = COALESCE(?, product_description),
        product_price = COALESCE(?, product_price),
        product_discount = COALESCE(?, product_discount),
        product_quantity = COALESCE(?, product_quantity),
        product_status = COALESCE(?, product_status),
        category_id = COALESCE(?, category_id),
        brand_id = COALESCE(?, brand_id),
        updated_by = COALESCE(?, updated_by)
      WHERE product_id = ?;
    `;

    const values = [
      productName,
      productSku,
      productDescription,
      productPrice,
      productDiscount,
      productQuantity,
      productStatus,
      categoryId,
      brandId,
      updatedBy,
      product_id,
    ];

    const [result] = await connection.execute(query, values);

    if ((result as any).affectedRows === 0) {
      throw new Error("Product not found or no changes made");
    }

    // Fetch the updated product data
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM products WHERE product_id = ?`,
      [product_id]
    );

    const updatedProduct = rows[0];

    // Update the cache for the specific product
    CacheUtil.set(cacheKey, updatedProduct, 60); // Cache expiry: 1 hour

    // Optionally, you can batch update or invalidate other relevant caches
    CacheUtil.invalidate(allProductsCacheKey); // Invalidate allProducts cache to refresh the product list

    // Revalidate the products page
    revalidatePath("/dashboard/products");

    return { success: true, product: updatedProduct };
  });
}
