"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/Auth_actions/auth-actions";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { NewProductSchemaServer } from "./schema";
import { z } from "zod";
import sharp from "sharp";

export type FormState = {
  message: string;
  success?: boolean;
  fields?: Record<string, string>;
  issues?: string[];
};

// ======================
// Utility Functions
// ======================

/**
 * Converts a File object to a compressed Buffer
 */
async function fileToBuffer(file: File): Promise<Buffer> {
  if (!(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  // Validate file type
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ];

  if (!supportedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    // Process image with sharp
    return await sharp(buffer)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error("Image processing error:", error);
    throw new Error("Failed to process image");
  }
}

/**
 * Converts a base64 image string to a Buffer
 */
function base64ToBuffer(base64String: string): Buffer {
  if (!base64String.startsWith("data:image")) {
    throw new Error("Invalid base64 image string");
  }
  const base64Data = base64String.split("base64,")[1];
  return Buffer.from(base64Data, "base64");
}

/**
 * Converts a Buffer to a base64 image string
 */
function bufferToBase64(buffer: Buffer, mimeType = "image/webp"): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

/**
 * Checks if an image has changed
 */
function hasImageChanged(
  newImage: File | string | undefined,
  originalBase64: string | null
): boolean {
  if (!newImage) return false;
  if (typeof newImage === "string") {
    return newImage !== originalBase64;
  }
  return true; // It's a new File object
}

// ======================
// Data Parsing Functions
// ======================

function parseJSONField(data: FormData, fieldName: string) {
  try {
    const rawValue = data.get(fieldName);
    return rawValue ? JSON.parse(rawValue.toString()) : [];
  } catch (e) {
    console.error(`[PARSE ERROR] ${fieldName}:`, e);
    return [];
  }
}

function parseSuppliers(data: FormData) {
  return Array.from(data.entries())
    .filter(([key]) => key.startsWith("suppliers["))
    .map(([_, value]) => {
      try {
        return JSON.parse(value.toString());
      } catch (e) {
        console.error("[PARSE SUPPLIER ERROR]", e);
        return null;
      }
    })
    .filter((supplier) => supplier !== null);
}

function parseSpecifications(data: FormData) {
  return Array.from(data.entries())
    .filter(([key]) => key.startsWith("specifications["))
    .map(([_, value]) => {
      try {
        const spec = JSON.parse(value.toString());
        if (spec?.specification_name && spec?.specification_value) {
          return spec;
        }
        console.error("[INVALID SPEC FORMAT]", spec);
        return null;
      } catch (e) {
        console.error("[PARSE SPEC ERROR]", e);
        return null;
      }
    })
    .filter((spec) => spec !== null);
}

// ======================
// Database Operation Functions
// ======================

async function getChangedFields(
  existing: any,
  updated: z.infer<typeof NewProductSchemaServer>
) {
  const changed: Record<string, any> = {};
  const fieldsToCheck = [
    "product_name",
    "product_sku",
    "product_description",
    "long_description",
    "product_price",
    "product_quantity",
    "product_discount",
    "product_status",
    "category_id",
    "brand_id",
  ];

  fieldsToCheck.forEach((field) => {
    if (updated[field as keyof typeof updated] !== existing[field]) {
      changed[field] = updated[field as keyof typeof updated];
    }
  });

  return changed;
}

async function processImages(
  connection: any,
  productId: string,
  newData: any,
  existingImages: any
) {
  const updateFields: Record<string, Buffer> = {};

  // Process main image
  if (hasImageChanged(newData.main_image, existingImages.main_image)) {
    try {
      updateFields.main_image =
        typeof newData.main_image === "string"
          ? base64ToBuffer(newData.main_image)
          : await fileToBuffer(newData.main_image);
    } catch (error) {
      console.error("Failed to process main image:", error);
      // Fallback to existing image if processing fails
      if (existingImages.main_image) {
        updateFields.main_image = existingImages.main_image;
      }
    }
  }

  // Process thumbnails
  for (let i = 1; i <= 5; i++) {
    const fieldName = `thumbnail_image${i}`;
    const thumbnailKey = `thumbnails[${i - 1}]`;

    if (
      hasImageChanged(newData[thumbnailKey], existingImages.thumbnails?.[i - 1])
    ) {
      try {
        updateFields[fieldName] =
          typeof newData[thumbnailKey] === "string"
            ? base64ToBuffer(newData[thumbnailKey])
            : await fileToBuffer(newData[thumbnailKey]);
      } catch (error) {
        console.error(`Failed to process thumbnail ${i}:`, error);
        // Fallback to existing thumbnail if processing fails
        if (existingImages[fieldName]) {
          updateFields[fieldName] = existingImages[fieldName];
        }
      }
    }
  }

  // Process brand image
  if (hasImageChanged(newData.brand_image, existingImages.brand_image)) {
    try {
      updateFields.brand_image =
        typeof newData.brand_image === "string"
          ? base64ToBuffer(newData.brand_image)
          : await fileToBuffer(newData.brand_image);
    } catch (error) {
      console.error("Failed to process brand image:", error);
      // Fallback to existing image if processing fails
      if (existingImages.brand_image) {
        updateFields.brand_image = existingImages.brand_image;
      }
    }
  }

  // Only update if there are changes
  if (Object.keys(updateFields).length > 0) {
    await connection.query(
      `UPDATE product_images SET ${Object.keys(updateFields)
        .map((field) => `${field} = ?`)
        .join(", ")}
      WHERE product_id = ?`,
      [...Object.values(updateFields), productId]
    );
  }
}

async function processTags(
  connection: any,
  productId: string,
  newTags: string[]
) {
  // Get current tags
  const [existingTags] = await connection.query(
    `SELECT t.tag_id, t.tag_name
     FROM tags t
     JOIN product_tags pt ON t.tag_id = pt.tag_id
     WHERE pt.product_id = ?`,
    [productId]
  );

  const currentTagNames = existingTags.map((tag: any) => tag.tag_name);

  // Determine tags to add and remove
  const tagsToAdd = newTags.filter((tag) => !currentTagNames.includes(tag));
  const tagsToRemove = existingTags
    .filter((tag: any) => !newTags.includes(tag.tag_name))
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
  for (const tagName of tagsToAdd) {
    let tagId: number;

    // Check if tag exists
    const [tagRows] = await connection.query(
      "SELECT tag_id FROM tags WHERE tag_name = ?",
      [tagName]
    );

    if (tagRows.length > 0) {
      tagId = tagRows[0].tag_id;
    } else {
      const [insertResult] = await connection.query(
        "INSERT INTO tags (tag_name) VALUES (?)",
        [tagName]
      );
      tagId = insertResult.insertId;
    }

    await connection.query(
      "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
      [productId, tagId]
    );
  }
}

async function processSpecifications(
  connection: any,
  productId: string,
  newSpecs: Array<{
    specification_name: string;
    specification_value: string;
  }>,
  categoryId: number
) {
  // Get current specifications
  const [existingSpecs] = await connection.query(
    `SELECT ps.product_spec_id, ps.specification_id, ps.value, s.specification_name
     FROM product_specifications ps
     JOIN specifications s ON ps.specification_id = s.specification_id
     WHERE ps.product_id = ?`,
    [productId]
  );

  const currentSpecNames = existingSpecs.map(
    (spec: any) => spec.specification_name
  );

  // Determine specs to add, update, and remove
  const specsToAdd = newSpecs.filter(
    (spec) => !currentSpecNames.includes(spec.specification_name)
  );
  const specsToUpdate = newSpecs.filter(
    (spec) =>
      currentSpecNames.includes(spec.specification_name) &&
      existingSpecs.find(
        (s: any) =>
          s.specification_name === spec.specification_name &&
          s.value !== spec.specification_value
      )
  );
  const specsToRemove = existingSpecs
    .filter(
      (spec: any) =>
        !newSpecs.some((s) => s.specification_name === spec.specification_name)
    )
    .map((spec: any) => spec.product_spec_id);

  // Remove old specs
  if (specsToRemove.length > 0) {
    await connection.query(
      `DELETE FROM product_specifications
       WHERE product_spec_id IN (?)`,
      [specsToRemove]
    );
  }

  // Update changed specs
  for (const spec of specsToUpdate) {
    const existingSpec = existingSpecs.find(
      (s: any) => s.specification_name === spec.specification_name
    );

    await connection.query(
      `UPDATE product_specifications
       SET value = ?
       WHERE product_spec_id = ?`,
      [spec.specification_value, existingSpec.product_spec_id]
    );
  }

  // Add new specs
  for (const spec of specsToAdd) {
    let specId: number;

    // Check if spec exists
    const [specRows] = await connection.query(
      "SELECT specification_id FROM specifications WHERE specification_name = ?",
      [spec.specification_name]
    );

    if (specRows.length > 0) {
      specId = specRows[0].specification_id;
    } else {
      const [insertResult] = await connection.query(
        "INSERT INTO specifications (specification_name) VALUES (?)",
        [spec.specification_name]
      );
      specId = insertResult.insertId;
    }

    // Link specification to category if not already linked
    const [categorySpecCheck] = await connection.query(
      "SELECT 1 FROM category_specifications WHERE category_id = ? AND specification_id = ?",
      [categoryId, specId]
    );
    if (categorySpecCheck.length === 0) {
      await connection.query(
        "INSERT INTO category_specifications (category_id, specification_id) VALUES (?, ?)",
        [categoryId, specId]
      );
    }

    await connection.query(
      "INSERT INTO product_specifications (product_id, specification_id, value) VALUES (?, ?, ?)",
      [productId, specId, spec.specification_value]
    );
  }
}

// ======================
// Main Update Function
// ======================

export async function updateProductAction(
  prevState: FormState,
  productId: string,
  data: FormData
): Promise<FormState> {
  const start = performance.now();
  const formEntries = Object.fromEntries(data.entries());

  const user = await getCurrentUser();
  if (!user) return { message: "Please login to continue." };
  if (user.role !== "admin")
    return { message: "Only admins can update products." };

  if (!productId) return { message: "Invalid product ID" };

  try {
    // Parse form data
    const tags = parseJSONField(data, "tags");
    const suppliers = parseSuppliers(data);
    const specifications = parseSpecifications(data);
    const thumbnails = Array.from(data.getAll("thumbnails"));
    const main_image = data.get("main_image");
    const brand_image = data.get("brand_image");

    const parsed = NewProductSchemaServer.safeParse({
      ...formEntries,
      tags,
      main_image,
      thumbnails,
      brand_image,
      suppliers,
      specifications,
      product_id: productId,
    });

    if (!parsed.success) {
      console.error("🛑 Validation failed:", parsed.error.flatten());
      return {
        message: "Validation failed",
        fields: Object.fromEntries(
          Object.entries(formEntries).filter(
            ([_, value]) => typeof value === "string"
          ) as [string, string][]
        ),
        issues: parsed.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`
        ),
      };
    }

    const parsedData = parsed.data;

    return await dbOperation(async (connection) => {
      await connection.beginTransaction();

      try {
        // Verify product exists and get current data
        const [productRows] = await connection.query(
          "SELECT * FROM products WHERE product_id = ? FOR UPDATE",
          [productId]
        );
        if (!productRows.length) {
          return { message: "Product not found" };
        }
        const existingProduct = productRows[0];

        // Check for SKU conflict
        if (parsedData.product_sku !== existingProduct.product_sku) {
          const [skuCheck] = await connection.query(
            "SELECT 1 FROM products WHERE product_sku = ? AND product_id != ? LIMIT 1",
            [parsedData.product_sku, productId]
          );
          if (skuCheck.length > 0) {
            return {
              message: "Product SKU already exists",
              issues: ["Duplicate SKU"],
            };
          }
        }

        // Get existing images
        const [existingImagesRows] = await connection.query(
          "SELECT * FROM product_images WHERE product_id = ?",
          [productId]
        );
        const existingImages = existingImagesRows[0] || {};

        // Convert existing images to base64 for comparison
        const existingImageData = {
          main_image: existingImages.main_image
            ? bufferToBase64(existingImages.main_image)
            : null,
          thumbnails: [
            existingImages.thumbnail_image1
              ? bufferToBase64(existingImages.thumbnail_image1)
              : null,
            existingImages.thumbnail_image2
              ? bufferToBase64(existingImages.thumbnail_image2)
              : null,
            existingImages.thumbnail_image3
              ? bufferToBase64(existingImages.thumbnail_image3)
              : null,
            existingImages.thumbnail_image4
              ? bufferToBase64(existingImages.thumbnail_image4)
              : null,
            existingImages.thumbnail_image5
              ? bufferToBase64(existingImages.thumbnail_image5)
              : null,
          ],
          brand_image: existingImages.brand_image
            ? bufferToBase64(existingImages.brand_image)
            : null,
        };

        // Update product core data
        const changedFields = await getChangedFields(
          existingProduct,
          parsedData
        );
        if (Object.keys(changedFields).length > 0) {
          await connection.query(
            `UPDATE products SET ${Object.keys(changedFields)
              .map((field) => `${field} = ?`)
              .join(", ")}
            WHERE product_id = ?`,
            [...Object.values(changedFields), productId]
          );
        }

        // Process images
        await processImages(
          connection,
          productId,
          {
            main_image: parsedData.main_image,
            thumbnails: parsedData.thumbnails,
            brand_image: parsedData.brand_image,
          },
          {
            ...existingImages,
            thumbnails: existingImageData.thumbnails,
            main_image: existingImageData.main_image,
            brand_image: existingImageData.brand_image,
          }
        );

        // Process tags
        await processTags(connection, productId, parsedData.tags);

        // Process specifications
        await processSpecifications(
          connection,
          productId,
          parsedData.specifications,
          parsedData.category_id
        );

        await connection.commit();
        revalidatePath("/dashboard/products");

        console.log(
          `✅ Product updated successfully in ${Date.now() - start}ms`
        );
        return { success: true, message: "Product updated successfully" };
      } catch (error) {
        await connection.rollback();
        console.error("Transaction error:", error);
        throw error;
      }
    });
  } catch (error) {
    console.error("🔥 updateProductAction failed", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      message: "Something went wrong. Please try again.",
      issues: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
