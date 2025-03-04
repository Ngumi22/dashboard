// createVariant.ts
"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { variantFormSchema } from "@/components/Product/Variants/schema";
import { revalidatePath } from "next/cache";
import { parseVariantForm } from "./parse";

export async function createVariant(formData: FormData) {
  // Parse the FormData into a plain object.
  const parsedData = await parseVariantForm(formData);

  // Validate the parsed data against your schema.
  const validatedFields = variantFormSchema.safeParse(parsedData);
  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error };
  }

  let variantId = validatedFields.data.variantId;
  const {
    productId,
    specifications,
    variantPrice,
    variantQuantity,
    variantStatus,
    images,
  } = validatedFields.data;

  try {
    const result = await dbOperation(async (connection) => {
      await connection.beginTransaction();

      if (variantId) {
        // Update existing variant if variantId exists.
        await connection.query(
          `UPDATE variants SET variant_price = ?, variant_quantity = ?, variant_status = ? WHERE variant_id = ?`,
          [variantPrice, variantQuantity, variantStatus, variantId]
        );

        // Delete old variant combinations.
        await connection.query(
          `DELETE FROM variant_combinations WHERE variant_id = ?`,
          [variantId]
        );
      } else {
        // Insert new variant.
        const [insertResult]: any = await connection.query(
          `INSERT INTO variants (product_id, variant_price, variant_quantity, variant_status)
           VALUES (?, ?, ?, ?)`,
          [productId, variantPrice, variantQuantity, variantStatus]
        );
        variantId = insertResult.insertId;
      }

      // Insert or update variant values and get their IDs.
      for (const { specificationId, value } of specifications) {
        // Check if the value already exists in variant_values.
        const [existingValue]: any = await connection.query(
          `SELECT variant_value_id FROM variant_values WHERE specification_id = ? AND value = ?`,
          [specificationId, value]
        );

        let variantValueId;
        if (existingValue.length > 0) {
          variantValueId = existingValue[0].variant_value_id;
        } else {
          // Insert new value into variant_values.
          const [insertValueResult]: any = await connection.query(
            `INSERT INTO variant_values (specification_id, value) VALUES (?, ?)`,
            [specificationId, value]
          );
          variantValueId = insertValueResult.insertId;
        }

        // Insert into variant_combinations.
        await connection.query(
          `INSERT INTO variant_combinations (variant_id, specification_id, variant_value_id) VALUES (?, ?, ?)`,
          [variantId, specificationId, variantValueId]
        );
      }

      // Handle variant images.
      if (images && images.length > 0) {
        // Remove any existing images.
        await connection.query(
          `DELETE FROM variant_images WHERE variant_id = ?`,
          [variantId]
        );

        for (const image of images) {
          await connection.query(
            `INSERT INTO variant_images (variant_id, image_data, image_type) VALUES (?, ?, ?)`,
            [variantId, Buffer.from(await image.arrayBuffer()), image.type]
          );
        }
      }

      await connection.commit();
      return { success: true, variantId };
    });

    revalidatePath(`/dashboard/products/${productId}/variants`);
    return result;
  } catch (error) {
    console.error("Error upserting variant:", error);
    return { error: "Failed to upsert variant" };
  }
}
