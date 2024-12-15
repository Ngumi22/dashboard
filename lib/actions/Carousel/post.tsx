"use server";

import { revalidatePath } from "next/cache";
import { fileToBuffer, getErrorMessage } from "@/lib/utils";
import { getConnection } from "@/lib/database";
import { dbsetupTables } from "@/lib/MysqlTables";
import { z } from "zod";

// Helper function for database operations

export async function dbOperation<T>(
  operation: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    await dbsetupTables();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();

    const errorMessage = getErrorMessage(error);

    // Log the error to the server console
    console.error(`[Server Error]: ${errorMessage}`);

    // Optionally, send the error to a monitoring service like Sentry
    // Sentry.captureException(error);

    throw new Error(errorMessage); // Re-throw for handling in API routes
  } finally {
    connection.release();
  }
}

const carouselSchema = z.object({
  carousel_id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  short_description: z.string().max(500).optional(),
  description: z.string().max(500).optional(),
  link: z.string().url().optional(),
  image: z.instanceof(Blob).optional(),
  status: z.enum(["active", "inactive"]),
  text_color: z.string().min(1, "Text color required"),
  background_color: z.string().min(1, "Background color required"),
});

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: File;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export async function createCarousel(prevState: any, data: FormData) {
  // Validate incoming data using Zod schema
  const validatedFields = carouselSchema.safeParse({
    carousel_id: data.get("carousel_id")
      ? Number(data.get("carousel_id"))
      : undefined,
    title: data.get("title") as string,
    short_description: data.get("short_description") as string,
    description: data.get("description") as string,
    link: data.get("link") as string,
    status: data.get("status") as "active" | "inactive",
    image: data.get("image") as File | null,
    text_color: data.get("text_color") as string,
    background_color: data.get("background_color") as string,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { data: fields } = validatedFields;
  let imagePath = null;

  // Process image if provided
  if (fields.image instanceof File) {
    try {
      imagePath = await fileToBuffer(fields.image);
    } catch (error) {
      console.error("Failed to process image:", error);
      return { success: false, error: "Failed to process image" };
    }
  }

  try {
    const result = await dbOperation(async (connection) => {
      // Insert new carousel
      const [rows] = await connection.execute(
        `INSERT INTO carousels
           (title, short_description, description, link, image, status, text_color, background_color)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fields.title,
          fields.short_description,
          fields.description,
          fields.link,
          imagePath,
          fields.status,
          fields.text_color,
          fields.background_color,
        ]
      );
      return {
        id: (rows as any).insertId,
        affectedRows: (rows as any).affectedRows,
      };
    });

    // Revalidate cache to update UI
    revalidatePath("/dashboard/carousels");
    return {
      success: true,
      message: fields.carousel_id
        ? "Carousel updated successfully"
        : "Carousel created successfully",
      id: result.id,
    };
  } catch (error) {
    console.error("Database operation failed:", error);
    return { success: false, error: "Failed to save carousel" };
  }
}
