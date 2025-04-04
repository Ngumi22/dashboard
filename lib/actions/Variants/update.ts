// updateVariant.ts
"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { variantFormSchema } from "@/components/Product/Variants/schema";
import { revalidatePath } from "next/cache";
import { parseVariantForm } from "./parse";

export async function updateVariant(variantId: number, formData: FormData) {
  if (!variantId) return { error: "Invalid variant ID" };

  // Parse the FormData.
  const parsedData = await parseVariantForm(formData);
  // Force the variantId from the parameter (if not provided via formData).
  parsedData.variantId = variantId;

  // Validate using your Zod schema.
  const validatedFields = variantFormSchema.safeParse(parsedData);
  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error };
  }

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

      // Update variant record.
      await connection.query(
        `UPDATE variants SET variant_price = ?, variant_quantity = ?, variant_status = ? WHERE variant_id = ?`,
        [variantPrice, variantQuantity, variantStatus, variantId]
      );

      // Delete and reinsert variant combinations.
      await connection.query(
        `DELETE FROM variant_combinations WHERE variant_id = ?`,
        [variantId]
      );

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

      // Update variant images.
      if (images && images.length > 0) {
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
      return { success: true };
    });

    revalidatePath(`/dashboard/products/${productId}/variants`);
    return result;
  } catch (error) {
    console.error("Error updating variant:", error);
    return { error: "Failed to update variant" };
  }
}
