"use server";

import { revalidatePath } from "next/cache";
import { fileToBuffer } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function createBanner(data: FormData) {
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
  });

  revalidatePath("/dashboard/banners");
  return {
    success: true,
    message: "Carousel saved successfully",
    id: result.id,
  };
}
