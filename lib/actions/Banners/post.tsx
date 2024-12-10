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

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: File;
  text_color: string;
  background_color: string;
  status: "active" | "inactive";
  usage_context: string;
}

export async function createBanner(data: FormData) {
  const banner_id = data.get("banner_id") as string;
  const title = data.get("title") as string;
  const description = data.get("description") as string;
  const link = data.get("link") as string;
  const text_color = data.get("text_color") as string;
  const background_color = data.get("background_color") as string;
  const status = data.get("status") as "active" | "inactive";
  const image = data.get("image") as File | null;
  const context = data.get("usage_context") as string;

  let imagePath = null;
  if (image) {
    imagePath = await fileToBuffer(image);
  }

  const result = await dbOperation(async (connection) => {
    if (banner_id) {
      const [rows] = await connection.execute(
        `UPDATE banners SET
           title = ?, description = ?, link = ?, text_color = ?, background_color = ?, status = ?, image = ?, usage_context = ?
           WHERE banner_id = ?`,
        [
          title,
          description,
          link,
          text_color,
          background_color,
          status,
          imagePath,
          context,
        ]
      );
      return {
        id: rows.banner_id,
      };
    } else {
      const [rows] = await connection.execute(
        `INSERT INTO banners (title, description, link, image, text_color, background_color,usage_context, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          link,
          imagePath,
          text_color,
          background_color,
          context,
          status,
        ]
      );
      return rows.insertId;
    }
  });

  revalidatePath("/dashboard/banners");
  return {
    success: true,
    message: "Carousel saved successfully",
    id: result.id,
  };
}
