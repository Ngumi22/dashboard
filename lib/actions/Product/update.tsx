"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { revalidatePath } from "next/cache";

export async function updateProductAction(
  product_id: string,
  formData: FormData
) {
  if (!product_id || !formData) {
    throw new Error("Invalid product ID or form data");
  }

  const cacheKey = `product_${product_id}`;
  const allProductsCacheKey = `products`;

  return dbOperation(async (connection) => {
    // Extract and parse form data
    const fields = [
      "product_name",
      "product_sku",
      "product_description",
      "product_price",
      "product_discount",
      "product_quantity",
      "product_status",
      "category_id",
      "brand_id",
      "updated_by",
      "suppliers", // Comma-separated supplier IDs
      "tags", // Comma-separated tag names
      "main_image",
      "thumbnail1",
      "thumbnail2",
      "thumbnail3",
      "thumbnail4",
      "thumbnail5",
    ];

    const values = fields.map((field) => {
      const value = formData.get(field);
      if (field === "product_price" || field === "product_discount") {
        return value ? parseFloat(value as string) : null;
      } else if (field === "product_quantity") {
        return value ? parseInt(value as string) : null;
      }
      return value;
    });

    // Prepare the SQL query for updating the product
    const updateProductQuery = `
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

    const [result] = await connection.execute(updateProductQuery, [
      ...values.slice(0, 10), // First 10 fields are for the products table
      product_id,
    ]);

    if ((result as any).affectedRows === 0) {
      throw new Error("Product not found or no changes made");
    }

    // Update product images
    const updateImagesQuery = `
      UPDATE product_images
      SET
        main_image = ?,
        thumbnail_image1 = ?,
        thumbnail_image2 = ?,
        thumbnail_image3 = ?,
        thumbnail_image4 = ?,
        thumbnail_image5 = ?
      WHERE product_id = ?;
    `;

    await connection.execute(updateImagesQuery, [
      values[10], // main_image
      values[11], // thumbnail1
      values[12], // thumbnail2
      values[13], // thumbnail3
      values[14], // thumbnail4
      values[15], // thumbnail5
      product_id,
    ]);

    // Update product suppliers
    const suppliers = (values[9] as string)?.split(",") || []; // Comma-separated supplier IDs
    await connection.execute(
      "DELETE FROM product_suppliers WHERE product_id = ?",
      [product_id]
    );
    for (const supplierId of suppliers) {
      await connection.execute(
        "INSERT INTO product_suppliers (product_id, supplier_id) VALUES (?, ?)",
        [product_id, supplierId]
      );
    }

    // Update product tags
    const tags = (values[10] as string)?.split(",") || []; // Comma-separated tag names
    await connection.execute("DELETE FROM product_tags WHERE product_id = ?", [
      product_id,
    ]);
    for (const tagName of tags) {
      // Insert new tags if they don't exist
      const [tagResult]: [RowDataPacket[], FieldPacket[]] =
        await connection.execute(
          "INSERT IGNORE INTO tags (tag_name) VALUES (?)",
          [tagName]
        );
      // Fetch the tag_id
      const [tagRows]: [RowDataPacket[], FieldPacket[]] =
        await connection.execute("SELECT tag_id FROM tags WHERE tag_name = ?", [
          tagName,
        ]);
      const tagId = tagRows[0]?.tag_id;
      if (tagId) {
        await connection.execute(
          "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
          [product_id, tagId]
        );
      }
    }

    // Fetch the updated product data
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT
          p.product_id,
          p.product_name AS name,
          p.product_sku AS sku,
          p.product_price AS price,
          p.product_discount AS discount,
          p.product_quantity AS quantity,
          c.category_name AS category,
          p.product_status AS status,
          p.product_description AS description,
          b.brand_name AS brand,
          GROUP_CONCAT(DISTINCT s.supplier_name ORDER BY s.supplier_name SEPARATOR ', ') AS suppliers,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          p.created_at AS createdAt,
          p.updated_at AS updatedAt,
          MAX(pi.main_image) AS main_image,
          MAX(pi.thumbnail_image1) AS thumbnail1,
          MAX(pi.thumbnail_image2) AS thumbnail2,
          MAX(pi.thumbnail_image3) AS thumbnail3,
          MAX(pi.thumbnail_image4) AS thumbnail4,
          MAX(pi.thumbnail_image5) AS thumbnail5,
          COALESCE(GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ','), '') AS tags
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      INNER JOIN categories c ON p.category_id = c.category_id
      INNER JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN product_suppliers ps ON p.product_id = ps.product_id
      LEFT JOIN suppliers s ON ps.supplier_id = s.supplier_id
      LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.product_id = ?
      GROUP BY p.product_id`,
      [product_id]
    );

    const updatedProduct = rows[0];

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: updatedProduct,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    // Invalidate allProducts cache to refresh the product list
    cache.delete(allProductsCacheKey);

    // Revalidate the products page
    revalidatePath("/dashboard/products");

    return { success: true, product: updatedProduct };
  });
}
