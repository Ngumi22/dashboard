"use server";

import { getConnection } from "@/lib/database";
import { cache } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

export async function updateProduct(productId: string, formData: FormData) {
  const cacheKey = `product_${productId}`;
  const connection = await getConnection();

  try {
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
      productId,
    ];

    const [result] = await connection.execute(query, values);

    if ((result as any).affectedRows === 0) {
      throw new Error("Product not found or no changes made");
    }

    // Fetch the updated product data
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM products WHERE product_id = ?`,
      [productId]
    );

    const updatedProduct = rows[0];

    // Update cache with the updated product
    cache.set(cacheKey, {
      value: updatedProduct,
      expiry: Date.now() + 3600 * 1000, // Cache expiry: 1 hour
    });

    // Revalidate the products page
    revalidatePath("/dashboard/products");

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  } finally {
    connection.release();
  }
}
