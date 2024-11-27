"use server";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { CategorySchema } from "@/lib/ZodSchemas/categorySchema";
import { addCategory } from "./post";
import { getConnection } from "@/lib/database";
import { cache } from "@/lib/cache";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function CategorySubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  // console.log("Raw formData: ", formData);

  // Validate form data using CategorySchema
  const parsed = CategorySchema.safeParse(formData);

  // console.log("Parsed: ", parsed);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  // console.log("success: ", parsed);

  try {
    // Call addCategory to insert or retrieve existing category
    const categoryResponse = await addCategory(data);
    const categoryResult = await categoryResponse.json();

    if (categoryResponse.ok) {
      return {
        message: categoryResult.message,
        fields: {
          category_name: parsed.data.category_name,
          category_description: parsed.data.category_description,
        },
      };
    } else {
      // Handle case when addCategory reports a problem
      return {
        message: categoryResult.message || "Failed to add category",
        issues: categoryResult.issues || [],
      };
    }
  } catch (error) {
    console.error("Error in CategorySubmitAction:", error);
    return {
      message: "An error occurred while submitting the category",
      issues: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

export async function updateCategoryAction(
  id: string,
  updatedData: FormData
): Promise<NextResponse> {
  const cacheKey = `category_${id}`;
  const connection = await getConnection();

  try {
    // Prepare data from FormData
    const categoryName = updatedData.get("category_name") as string | null;
    const categoryDescription = updatedData.get("category_description") as
      | string
      | null;
    const categoryImage = updatedData.get("category_image") as File | null;
    const status = updatedData.get("status") as string | null;

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
      id,
    ];

    const [result] = await connection.execute(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Category not found or no changes made" },
        { status: 404 }
      );
    }

    // Fetch updated data
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM categories WHERE category_id = ?`,
      [id]
    );

    const updatedCategory = rows[0];

    // Update cache
    cache.set(cacheKey, {
      value: updatedCategory,
      expiry: Date.now() + 3600 * 1000, // Cache expiry: 1 hour
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
