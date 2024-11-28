"use server";

import { revalidatePath } from "next/cache";
import { fileToBuffer, getErrorMessage } from "@/lib/utils";
import { dbsetupTables } from "@/lib/MysqlTables";
import { getConnection } from "@/lib/database";

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

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  button_text?: string;
  button_link?: string;
  image?: File;
  position: number;
  status: "active" | "inactive";
}

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: File;
  text_color: string;
  background_color: string;
  status: "active" | "inactive";
}

export async function createCarousel(data: FormData) {
  const title = data.get("title") as string;
  const short_description = data.get("short_description") as string;
  const button_text = data.get("button_text") as string;
  const button_link = data.get("button_link") as string;
  const position = parseInt(data.get("position") as string);
  const status = data.get("status") as "active" | "inactive";
  const image = data.get("image") as File | null;

  let imagePath = null;
  if (image) {
    imagePath = await fileToBuffer(image);
  }

  try {
    const result = await dbOperation(async (connection) => {
      const [rows] = await connection.execute(
        `INSERT INTO carousels (title, short_description, button_text, button_link, image, position, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          short_description,
          button_text,
          button_link,
          imagePath,
          position,
          status,
        ]
      );
      return rows.insertId;
    });

    revalidatePath("/admin/carousels");
    return { success: true, id: result };
  } catch (error) {
    console.error("Failed to create carousel:", error);
    return { success: false, error: "Failed to create carousel" };
  }
}

export async function createBanner(data: FormData) {
  const title = data.get("title") as string;
  const description = data.get("description") as string;
  const link = data.get("link") as string;
  const text_color = data.get("text_color") as string;
  const background_color = data.get("background_color") as string;
  const status = data.get("status") as "active" | "inactive";
  const image = data.get("image") as File | null;

  let imagePath = null;
  if (image) {
    imagePath = await fileToBuffer(image);
  }

  try {
    const result = await dbOperation(async (connection) => {
      const [rows] = await connection.execute(
        `INSERT INTO banners (title, description, link, image, text_color, background_color, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          link,
          imagePath,
          text_color,
          background_color,
          status,
        ]
      );
      return rows.insertId;
    });

    revalidatePath("/admin/banners");
    return { success: true, id: result };
  } catch (error) {
    console.error("Failed to create banner:", error);
    return { success: false, error: "Failed to create banner" };
  }
}
