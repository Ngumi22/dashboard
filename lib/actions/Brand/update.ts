"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { fileToBuffer } from "@/lib/utils";
import { brandSchema } from "@/lib/ZodSchemas/BrandSchema";

export const updateBrandAction = async (
  brand_id: string,
  formData: FormData
) => {
  try {
    // Validate and coerce incoming form data using Zod
    const validatedData = brandSchema.parse(Object.fromEntries(formData));
    const { brand_name, brand_image } = validatedData;

    if (!brand_id) {
      throw new Error("Brand ID is required.");
    }

    // Fetch the existing brand
    const existingBrand: any = await dbOperation(async (connection) => {
      const [brand]: any = await connection.execute(
        `SELECT * FROM brands WHERE brand_id = ? LIMIT 1`,
        [brand_id]
      );
      return brand.length > 0 ? brand[0] : null;
    });

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    let updates: string[] = [];
    let values: any[] = [];
    let hasChanges = false;

    // Check for changes in brand_name
    if (brand_name && brand_name !== existingBrand.brand_name) {
      updates.push("brand_name = ?");
      values.push(brand_name);
      hasChanges = true;
    }

    // Check for changes in brand_image
    if (brand_image instanceof File && brand_image.size > 0) {
      const imageBuffer = await fileToBuffer(brand_image);
      updates.push("brand_image = ?");
      values.push(imageBuffer);
      hasChanges = true;
    }

    if (!hasChanges) {
      throw new Error("No changes detected.");
    }

    // Update the brand
    await dbOperation(async (connection) => {
      const query = `UPDATE brands SET ${updates.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE brand_id = ?`;
      await connection.execute(query, [...values, brand_id]);
    });

    return { success: true, message: "Brand updated successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
