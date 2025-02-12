"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { fileToBuffer } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

// In productTypes.tsx
async function compressAndEncodeBase64(
  imageData: Buffer | string
): Promise<string> {
  let buffer: Buffer;

  if (typeof imageData === "string") {
    // Decode base64 string to Buffer
    buffer = Buffer.from(imageData, "base64");
  } else {
    buffer = imageData;
  }

  try {
    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: "inside" }) // Adjust resize options as needed
      .webp({ quality: 80 }) // Convert to WebP format with quality setting
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error:", error);
    throw error;
  }
}

export interface ProductUpdateData {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "pending" | "approved";
  tags: string[];
  main_image?: string;
  thumbnails?: string[];
  category_id: string;
  brand_id: string;
  specifications: {
    specification_id: string;
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  suppliers: {
    supplier_id?: number;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone_number?: string;
    supplier_location?: string;
    isNew?: boolean;
  }[];
}
async function toBuffer(
  image: File | string | null | undefined
): Promise<Buffer | null> {
  if (!image) {
    return null; // Return null for invalid or empty inputs
  }

  if (typeof image === "string") {
    // If it's a base64 string, convert it to a Buffer
    return Buffer.from(image, "base64");
  } else if (image instanceof File) {
    // If it's a file, convert it to a Buffer
    const arrayBuffer = await image.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } else {
    return null; // Return null for invalid inputs
  }
}
export const updateProductAction = async (
  productId: string,
  formData: FormData
) => {
  if (!productId) throw new Error("Invalid product ID");

  return dbOperation(async (connection) => {
    await connection.beginTransaction();
    const cacheKey = `product_${productId}`;

    try {
      // Fetch existing product
      const [productRows]: any = await connection.query(
        "SELECT * FROM products WHERE product_id = ?",
        [productId]
      );
      const existingProduct = productRows[0];
      if (!existingProduct) throw new Error("Product not found");

      // Prepare update data
      const updateFields: Partial<ProductUpdateData> = {};
      const formFields: Partial<ProductUpdateData> = {
        product_id: Number(formData.get("product_id")),
        product_name: formData.get("product_name")?.toString(),
        product_sku: formData.get("product_sku")?.toString(),
        product_description: formData.get("product_description")?.toString(),
        product_price: Number(formData.get("product_price")),
        product_discount: Number(formData.get("product_discount")),
        product_quantity: Number(formData.get("product_quantity")),
        product_status: formData.get("product_status") as
          | "draft"
          | "pending"
          | "approved",
        category_id: formData.get("category_id")?.toString(),
        brand_id: formData.get("brand_id")?.toString(),
      };

      // Identify changed fields
      Object.entries(formFields).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== existingProduct[key as keyof ProductUpdateData]
        ) {
          updateFields[key as keyof ProductUpdateData] = value as any;
        }
      });

      // Handle main image
      const mainImage = formData.get("main_image");
      const mainImageBuffer = await toBuffer(mainImage as File | string);

      // Handle thumbnails
      const thumbnailFiles = formData.getAll("thumbnails") as (File | string)[];
      const thumbnailBuffers = await Promise.all(
        thumbnailFiles.map((file) => toBuffer(file))
      );

      // Update database with new or existing images
      await connection.query(
        `INSERT INTO product_images (product_id, main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           main_image = COALESCE(?, main_image),
           thumbnail_image1 = COALESCE(?, thumbnail_image1),
           thumbnail_image2 = COALESCE(?, thumbnail_image2),
           thumbnail_image3 = COALESCE(?, thumbnail_image3),
           thumbnail_image4 = COALESCE(?, thumbnail_image4),
           thumbnail_image5 = COALESCE(?, thumbnail_image5)`,
        [
          productId,
          mainImageBuffer,
          ...thumbnailBuffers, // Spread the 5 thumbnail values
          mainImageBuffer,
          ...thumbnailBuffers, // Spread the 5 thumbnail values again
        ]
      );

      // Update product details if necessary
      if (Object.keys(updateFields).length > 0) {
        const updateColumns = Object.keys(updateFields)
          .map((key) => `${key} = ?`)
          .join(", ");

        const updateValues = Object.values(updateFields);
        updateValues.push(productId);

        await connection.query(
          `UPDATE products SET ${updateColumns} WHERE product_id = ?`,
          updateValues
        );
      }

      // Handle suppliers
      const suppliers = JSON.parse(
        formData.get("suppliers")?.toString() || "[]"
      );

      if (suppliers.length > 0) {
        await connection.query(
          "DELETE FROM product_suppliers WHERE product_id = ?",
          [productId]
        );

        const newSupplierIds: number[] = [];
        for (const supplier of suppliers.filter((s: any) => s.isNew)) {
          const [result]: any = await connection.query(
            "INSERT INTO suppliers (supplier_name, supplier_email, supplier_phone_number, supplier_location) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE supplier_name = VALUES(supplier_name), supplier_email = VALUES(supplier_email), supplier_phone_number = VALUES(supplier_phone_number), supplier_location = VALUES(supplier_location)",
            [
              supplier.supplier_name,
              supplier.supplier_email,
              supplier.supplier_phone_number,
              supplier.supplier_location,
            ]
          );
          newSupplierIds.push(result.insertId);
        }

        // Insert product-supplier relationships
        const allSupplierIds = [
          ...suppliers
            .filter((s: any) => !s.isNew)
            .map((s: any) => s.supplier_id!),
          ...newSupplierIds,
        ];

        if (allSupplierIds.length > 0) {
          await connection.query(
            "INSERT INTO product_suppliers (product_id, supplier_id) VALUES ?",
            [allSupplierIds.map((id) => [productId, id])]
          );
        }
      }

      // Handle tags
      const tags = JSON.parse(formData.get("tags")?.toString() || "[]");

      if (tags.length > 0) {
        await connection.query(
          "DELETE FROM product_tags WHERE product_id = ?",
          [productId]
        );

        const tagIds: number[] = [];
        for (const tagName of tags) {
          const [existingTag]: any = await connection.query(
            "SELECT tag_id FROM tags WHERE tag_name = ?",
            [tagName]
          );

          if (existingTag.length === 0) {
            const [insertResult]: any = await connection.query(
              "INSERT INTO tags (tag_name) VALUES (?)",
              [tagName]
            );
            tagIds.push(insertResult.insertId);
          } else {
            tagIds.push(existingTag[0].tag_id);
          }
        }

        if (tagIds.length > 0) {
          await connection.query(
            "INSERT INTO product_tags (product_id, tag_id) VALUES ?",
            [tagIds.map((tagId) => [productId, tagId])]
          );
        }
      }

      // Commit transaction
      await connection.commit();

      // Cache invalidation
      cache.delete(cacheKey);
      revalidatePath("/dashboard/products");

      return { success: true, message: "Product updated successfully" };
    } catch (error: any) {
      await connection.rollback();
      console.error("Transaction rolled back:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  });
};
