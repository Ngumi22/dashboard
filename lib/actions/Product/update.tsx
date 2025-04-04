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

      // Handle tags
      const tagsInput = formData.get("tags") as string;
      const tags: string[] = tagsInput ? JSON.parse(tagsInput) : [];

      // Fetch existing tags for the product
      const [existingTags]: any = await connection.query(
        `SELECT t.tag_id, t.tag_name
         FROM tags t
         JOIN product_tags pt ON t.tag_id = pt.tag_id
         WHERE pt.product_id = ?`,
        [productId]
      );

      const existingTagNames = existingTags.map((tag: any) => tag.tag_name);
      const newTags = tags.filter((tag) => !existingTagNames.includes(tag));
      const tagsToRemove = existingTags
        .filter((tag: any) => !tags.includes(tag.tag_name))
        .map((tag: any) => tag.tag_id);

      // Remove old tags
      if (tagsToRemove.length > 0) {
        await connection.query(
          `DELETE FROM product_tags
           WHERE product_id = ? AND tag_id IN (?)`,
          [productId, tagsToRemove]
        );
      }

      // Add new tags
      for (const tagName of newTags) {
        // Check if the tag already exists in the tags table
        const [tagRows]: any = await connection.query(
          "SELECT tag_id FROM tags WHERE tag_name = ?",
          [tagName]
        );

        let tagId: number;
        if (tagRows.length > 0) {
          // Use existing tag
          tagId = tagRows[0].tag_id;
        } else {
          // Insert new tag
          const [insertResult]: any = await connection.query(
            "INSERT INTO tags (tag_name) VALUES (?)",
            [tagName]
          );
          tagId = insertResult.insertId;
        }

        // Link tag to product
        await connection.query(
          "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
          [productId, tagId]
        );
      }

      // Handle specifications
      const specificationsInput = formData.get("specifications") as string;
      const specifications: {
        specification_id?: string;
        specification_name: string;
        specification_value: string;
        category_id: string;
      }[] = specificationsInput ? JSON.parse(specificationsInput) : [];

      // Fetch existing specifications for the product
      const [existingSpecifications]: any = await connection.query(
        `SELECT ps.product_spec_id, ps.specification_id, ps.value, s.specification_name
         FROM product_specifications ps
         JOIN specifications s ON ps.specification_id = s.specification_id
         WHERE ps.product_id = ?`,
        [productId]
      );

      const existingSpecNames = existingSpecifications.map(
        (spec: any) => spec.specification_name
      );
      const newSpecs = specifications.filter(
        (spec) => !existingSpecNames.includes(spec.specification_name)
      );
      const specsToRemove = existingSpecifications
        .filter(
          (spec: any) =>
            !specifications.some(
              (s) => s.specification_name === spec.specification_name
            )
        )
        .map((spec: any) => spec.product_spec_id);

      // Remove old specifications
      if (specsToRemove.length > 0) {
        await connection.query(
          `DELETE FROM product_specifications
           WHERE product_spec_id IN (?)`,
          [specsToRemove]
        );
      }

      // Add new specifications
      for (const spec of newSpecs) {
        // Check if the specification already exists in the specifications table
        const [specRows]: any = await connection.query(
          "SELECT specification_id FROM specifications WHERE specification_name = ?",
          [spec.specification_name]
        );

        let specId: number;
        if (specRows.length > 0) {
          // Use existing specification
          specId = specRows[0].specification_id;
        } else {
          // Insert new specification
          const [insertResult]: any = await connection.query(
            "INSERT INTO specifications (specification_name) VALUES (?)",
            [spec.specification_name]
          );
          specId = insertResult.insertId;
        }

        // Link specification to product
        await connection.query(
          "INSERT INTO product_specifications (product_id, specification_id, value) VALUES (?, ?, ?)",
          [productId, specId, spec.specification_value]
        );
      }

      // Update product details
      const updateFields: Partial<ProductUpdateData> = {
        product_name: formData.get("product_name") as string,
        product_sku: formData.get("product_sku") as string,
        product_description: formData.get("product_description") as string,
        product_price: parseFloat(formData.get("product_price") as string),
        product_quantity: parseInt(
          formData.get("product_quantity") as string,
          10
        ),
        product_discount: parseFloat(
          formData.get("product_discount") as string
        ),
        product_status: formData.get("product_status") as
          | "draft"
          | "pending"
          | "approved",
        category_id: formData.get("category_id") as string,
        brand_id: formData.get("brand_id") as string,
      };

      // Identify changed fields
      const changedFields: Partial<ProductUpdateData> = {};
      Object.entries(updateFields).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== existingProduct[key as keyof ProductUpdateData]
        ) {
          changedFields[key as keyof ProductUpdateData] = value as any;
        }
      });

      // Update product details if there are changes
      if (Object.keys(changedFields).length > 0) {
        const updateColumns = Object.keys(changedFields)
          .map((key) => `${key} = ?`)
          .join(", ");
        const updateValues = Object.values(changedFields);
        updateValues.push(productId);

        await connection.query(
          `UPDATE products SET ${updateColumns} WHERE product_id = ?`,
          updateValues
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
