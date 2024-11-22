"use server";

import { getConnection } from "@/lib/database";
import { cache } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { FieldPacket, RowDataPacket } from "mysql2/promise";

interface UpdateCategoryData {
  category_name?: string;
  category_description?: string;
  category_image?: File;
  status?: string;
}

export async function updateCategory(category_id: string, formData: FormData) {
  const cacheKey = `category_${category_id}`;
  const connection = await getConnection();

  try {
    // Prepare data from FormData
    const categoryName = formData.get("category_name") as string | null;
    const categoryDescription = formData.get("category_description") as
      | string
      | null;
    const categoryImage = formData.get("category_image") as File | null;
    const status = formData.get("status") as string | null;

    // Convert the categoryImage to a buffer if provided
    let categoryImageBuffer: Buffer | null = null;
    if (categoryImage && categoryImage instanceof File) {
      categoryImageBuffer = Buffer.from(await categoryImage.arrayBuffer());
    }

    const query = `
      UPDATE categories
      SET
        category_name = COALESCE(?, category_name),
        category_image = COALESCE(?, category_image),
        category_description = COALESCE(?, category_description),
        status = COALESCE(?, status)
      WHERE category_id = ?;
    `;

    const values = [
      categoryName,
      categoryImageBuffer,
      categoryDescription,
      status,
      category_id,
    ];

    const [result] = await connection.execute(query, values);

    if ((result as any).affectedRows === 0) {
      throw new Error("Category not found or no changes made");
    }

    // Fetch updated data
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM categories WHERE category_id = ?`,
      [category_id]
    );

    const updatedCategory = rows[0];

    // Convert category_image to Base64 if it exists
    if (updatedCategory?.category_image) {
      updatedCategory.category_image =
        updatedCategory.category_image.toString("base64");
    }

    // Update cache
    cache.set(cacheKey, {
      value: updatedCategory,
      expiry: Date.now() + 3600 * 1000, // Cache expiry: 1 hour
    });

    // Revalidate the categories page
    revalidatePath("/dashboard/orders");

    return { success: true, category: updatedCategory };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  } finally {
    connection.release();
  }
}
