"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import {
  VariantFormValues,
  VariantSchema,
} from "@/lib/ZodSchemas/variantSchema";

export async function saveVariant(data: VariantFormValues) {
  // Validate the form data using Zod
  const validatedData = VariantSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid data", details: validatedData.error.flatten() };
  }

  const { variant_id, images, ...variantData } = validatedData.data;

  try {
    const result = await dbOperation(async (connection) => {
      let variantId = variant_id;

      if (variantId) {
        // Update existing variant
        await connection.query(
          `UPDATE variants SET
           product_id = ?,
           specification_id = ?,
           value = ?,
           variant_price = ?,
           variant_quantity = ?,
           variant_status = ?
           WHERE variant_id = ?`,
          [
            variantData.product_id,
            variantData.specification_id,
            variantData.value,
            variantData.variant_price,
            variantData.variant_quantity,
            variantData.variant_status,
            variantId,
          ]
        );
      } else {
        // Insert new variant
        const [insertResult] = await connection.query(
          `INSERT INTO variants
           (product_id, specification_id, value, variant_price, variant_quantity, variant_status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            variantData.product_id,
            variantData.specification_id,
            variantData.value,
            variantData.variant_price,
            variantData.variant_quantity,
            variantData.variant_status,
          ]
        );
        variantId = insertResult.insertId; // Get the new variant_id
      }

      // Handle variant images
      if (images && images.length > 0) {
        // Delete existing images if updating
        if (variant_id) {
          await connection.query(
            `DELETE FROM variant_images WHERE variant_id = ?`,
            [variantId]
          );
        }

        // Insert new images
        for (const image of images) {
          await connection.query(
            `INSERT INTO variant_images
             (variant_id, image_data, image_type)
             VALUES (?, ?, ?)`,
            [variantId, image.image_data, image.image_type]
          );
        }
      }

      return {
        success: variantId
          ? "Variant updated successfully"
          : "Variant added successfully",
      };
    });

    return result;
  } catch (error) {
    console.error("Database error:", error);
    return { error: "Failed to save variant" };
  }
}
