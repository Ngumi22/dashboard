"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

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
  image: File | string | Buffer | null | undefined
): Promise<Buffer | null> {
  // console.log("toBuffer received:", { imageType: typeof image, image });

  if (!image) {
    console.warn("No image provided to toBuffer.");
    return null;
  }

  if (Buffer.isBuffer(image)) {
    console.log("Processing an existing Buffer, length:", image.length);
    if (image.length < 100) {
      console.warn("Buffer is too small:", image.length);
      return null;
    }
    try {
      const metadata = await sharp(image).metadata();
      if (!metadata.format) {
        console.warn("Unsupported image format in Buffer:", metadata);
        return null;
      }
    } catch (error) {
      console.error("Error validating Buffer:", { error });
      return null;
    }
    return image;
  }

  try {
    let buffer: Buffer;

    if (typeof image === "string") {
      console.log(
        "Processing a string image, first 50 chars:",
        image.substring(0, 50)
      );

      if (!image.startsWith("data:image/")) {
        console.warn(
          "Image string does not start with a valid data URI. Likely unchanged:",
          image.substring(0, 50)
        );
        return null;
      }

      const matches = image.match(/^data:image\/\w+;base64,(.+)$/);
      if (!matches) {
        console.warn(
          "Data URI does not match expected format:",
          image.substring(0, 50)
        );
        return null;
      }

      buffer = Buffer.from(matches[1], "base64");
    } else if (
      typeof image === "object" &&
      image !== null &&
      typeof (image as any).arrayBuffer === "function"
    ) {
      console.log("Processing a File/Blob-like object.");
      const arrayBuffer = await (image as any).arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      console.warn("Invalid input type for image:", {
        receivedType: typeof image,
        image,
      });
      return null;
    }

    console.log("Buffer created, length:", buffer.length);
    if (buffer.length < 100) {
      console.warn("Converted buffer is too small:", buffer.length);
      return null;
    }

    const metadata = await sharp(buffer).metadata();
    if (!metadata.format) {
      console.warn("Unsupported image format:", metadata);
      return null;
    }
    return buffer;
  } catch (error) {
    console.error("Error converting image to buffer:", { error });
    return null;
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
      console.log("Fetching existing product data for product ID:", productId);
      const [productRows]: any = await connection.query(
        "SELECT * FROM products WHERE product_id = ?",
        [productId]
      );
      const existingProduct = productRows[0];
      if (!existingProduct) throw new Error("Product not found");

      console.log("Fetching existing images...");
      const [existingImages]: any = await connection.query(
        "SELECT main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5 FROM product_images WHERE product_id = ?",
        [productId]
      );

      let currentImages: any = existingImages.length ? existingImages[0] : {};

      if (!existingImages.length) {
        console.warn(
          "No existing images found. Inserting a placeholder row..."
        );
        await connection.query(
          "INSERT INTO product_images (product_id) VALUES (?)",
          [productId]
        );
      }

      // Process the main image.
      const mainImageInput = formData.get("main_image");
      //console.log("Main image received:", { mainImageInput });

      let mainImageBuffer: Buffer | null = null;
      if (mainImageInput) {
        mainImageBuffer = await toBuffer(
          mainImageInput as File | string | Buffer
        );

        if (!mainImageBuffer) {
          console.warn(
            "Main image not updated or invalid, using existing image."
          );
        }
      }

      // Process thumbnails.
      const thumbnails = formData.getAll("thumbnails") as (
        | File
        | string
        | Buffer
      )[];
      // console.log("Thumbnails received:", thumbnails);

      const thumbnailBuffers = await Promise.all(
        thumbnails.map(async (img, index) => {
          try {
            const buffer = await toBuffer(img);
            return buffer || currentImages[`thumbnail_image${index + 1}`];
          } catch (error) {
            console.error(`Error processing thumbnail ${index + 1}:`, error);
            return currentImages[`thumbnail_image${index + 1}`]; // Retain existing image
          }
        })
      );

      // Ensure exactly 5 thumbnails, padding with existing values
      const paddedThumbnailBuffers = Array.from(
        { length: 5 },
        (_, index) =>
          thumbnailBuffers[index] ??
          currentImages[`thumbnail_image${index + 1}`]
      );

      // Log final image values before updating
      console.log("Final image values being updated:", {
        mainImageBuffer: mainImageBuffer?.length || "Unchanged",
        thumbnails: paddedThumbnailBuffers.map((buf, idx) => ({
          [`thumbnail_image${idx + 1}`]: buf?.length || "Unchanged",
        })),
      });

      if (
        mainImageBuffer ||
        paddedThumbnailBuffers.some(
          (buf, idx) => buf !== currentImages[`thumbnail_image${idx + 1}`]
        )
      ) {
        await connection.query(
          `UPDATE product_images SET
            main_image = COALESCE(?, main_image),
            thumbnail_image1 = COALESCE(?, thumbnail_image1),
            thumbnail_image2 = COALESCE(?, thumbnail_image2),
            thumbnail_image3 = COALESCE(?, thumbnail_image3),
            thumbnail_image4 = COALESCE(?, thumbnail_image4),
            thumbnail_image5 = COALESCE(?, thumbnail_image5)
          WHERE product_id = ?`,
          [mainImageBuffer, ...paddedThumbnailBuffers, productId]
        );
      }

      // Commit the transaction and invalidate the cache.
      await connection.commit();
      revalidatePath("/dashboard/products");

      console.log("Product update successful.");
      return { success: true, message: "Product updated successfully" };
    } catch (error: any) {
      await connection.rollback();
      console.error("Transaction rolled back:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  });
};
