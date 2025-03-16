"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";

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

/**
 * Converts an image (File, base64 string, or Buffer) to a Buffer.
 * Validates the image format before processing.
 */

async function toBuffer(
  image: File | string | null | undefined
): Promise<Buffer | null> {
  if (!image) {
    return null; // Return null for invalid or empty inputs
  }

  try {
    let buffer: Buffer;

    if (typeof image === "string") {
      // If it's a base64 string, remove the prefix and convert it to a Buffer
      const base64String = image.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64String, "base64");
    } else if (image instanceof File) {
      // If it's a file, convert it to a Buffer
      const arrayBuffer = await image.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error("Invalid input type");
    }

    // Convert Buffer to Uint8Array for file-type validation
    const uint8Array = new Uint8Array(buffer);

    // Validate the image format using file-type
    const type = await fileTypeFromBuffer(uint8Array);
    if (!type || !type.mime.startsWith("image/")) {
      throw new Error("Unsupported image format");
    }

    // Validate the image format using sharp
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format) {
      throw new Error("Unsupported image format");
    }

    console.log("Detected MIME type:", type);

    console.log("Image metadata:", metadata);

    return buffer;
  } catch (error) {
    console.error("Error converting image to buffer:", {
      error,
      input: image,
    });
    throw new Error("Invalid or unsupported image format");
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

      // Fetch existing images
      const [existingImages]: any = await connection.query(
        "SELECT main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5 FROM product_images WHERE product_id = ?",
        [productId]
      );

      if (!existingImages.length) throw new Error("Product images not found");

      const currentImages = existingImages[0];

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

      // Process main image if changed
      const mainImageInput = formData.get("main_image");
      let mainImageBuffer: Buffer | null = null;

      if (mainImageInput) {
        try {
          mainImageBuffer = await toBuffer(mainImageInput as File | string);
        } catch (error) {
          console.warn("Skipping invalid main image:", error);
        }
      }

      // Process thumbnails if changed
      const thumbnails = formData.getAll("thumbnails") as (File | string)[];
      const thumbnailBuffers = await Promise.all(
        thumbnails.map(async (img) => {
          try {
            return await toBuffer(img);
          } catch (error) {
            console.warn("Skipping invalid thumbnail:", error);
            return null;
          }
        })
      );

      // Prepare final images (only update changed images)
      const finalThumbnails = [
        thumbnailBuffers[0] ?? currentImages.thumbnail_image1,
        thumbnailBuffers[1] ?? currentImages.thumbnail_image2,
        thumbnailBuffers[2] ?? currentImages.thumbnail_image3,
        thumbnailBuffers[3] ?? currentImages.thumbnail_image4,
        thumbnailBuffers[4] ?? currentImages.thumbnail_image5,
      ];

      // Update product_images table only if images have changed
      if (
        mainImageBuffer ||
        thumbnailBuffers.some((buffer) => buffer !== null)
      ) {
        await connection.query(
          `UPDATE product_images SET
            main_image = ?,
            thumbnail_image1 = ?,
            thumbnail_image2 = ?,
            thumbnail_image3 = ?,
            thumbnail_image4 = ?,
            thumbnail_image5 = ?
          WHERE product_id = ?`,
          [
            mainImageBuffer ?? currentImages.main_image,
            ...finalThumbnails,
            productId,
          ]
        );
      }

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
