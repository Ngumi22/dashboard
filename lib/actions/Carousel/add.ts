"use server";

import { revalidatePath } from "next/cache";
import { fileToBuffer } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { carouselSchema } from "@/lib/ZodSchemas/CarouselSchema";

export async function createCarousel(data: FormData) {
  try {
    // Parse and validate the form data
    const validatedData = carouselSchema.parse(Object.fromEntries(data));

    const {
      title,
      short_description,
      description,
      link,
      text_color,
      background_color,
      status,
    } = validatedData;

    const image = data.get("image") as File | null;

    let imageBuffer = null;
    if (image) {
      imageBuffer = await fileToBuffer(image);
    }

    const result = await dbOperation(async (connection) => {
      // Insert the carousel
      const [rows]: any = await connection.execute(
        `INSERT INTO carousels
           (title, short_description, description, link, image, status, text_color, background_color)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          short_description,
          description,
          link,
          imageBuffer,
          status,
          text_color,
          background_color,
        ]
      );

      return { id: rows.insertId };
    });

    revalidatePath("/dashboard/carousels");
    return {
      success: true,
      message: "Carousel created successfully.",
      id: result.id,
    };
  } catch (error) {
    console.error("Error in createCarousel:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}
