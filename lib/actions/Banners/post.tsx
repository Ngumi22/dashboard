"use server";

import { revalidatePath } from "next/cache";
import { fileToBuffer } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { bannerSchema } from "@/lib/ZodSchemas/bannerschema";

export async function createBanner(data: FormData) {
  try {
    // Parse and validate the form data
    const validatedData = bannerSchema.parse(Object.fromEntries(data));

    const {
      title,
      description,
      link,
      text_color,
      background_color,
      status,
      context_type,
      usage_context_id,
      new_context_name,
    } = validatedData;

    const image = data.get("image") as File | null;

    let imagePath = null;
    if (image) {
      imagePath = await fileToBuffer(image);
    }

    const result = await dbOperation(async (connection) => {
      let contextId: number;

      if (context_type === "existing" && usage_context_id) {
        // Verify the existing context
        const [existingContext]: any = await connection.execute(
          `SELECT context_id FROM usage_contexts WHERE context_id = ? LIMIT 1`,
          [usage_context_id]
        );

        if (existingContext.length === 0) {
          throw new Error("Selected context does not exist");
        }

        contextId = Number(usage_context_id);
      } else if (context_type === "new" && new_context_name) {
        // Insert the new context
        const [insertedContext]: any = await connection.execute(
          `INSERT INTO usage_contexts (name) VALUES (?)`,
          [new_context_name]
        );
        contextId = insertedContext.insertId;
      } else {
        throw new Error("Invalid context data provided");
      }

      // Insert the banner
      const [rows]: any = await connection.execute(
        `INSERT INTO banners (title, description, link, image, text_color, background_color, usage_context_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          link,
          imagePath,
          text_color,
          background_color,
          contextId,
          status,
        ]
      );

      return { id: rows.insertId };
    });

    revalidatePath("/dashboard/banners");
    return {
      success: true,
      message: "Banner saved successfully",
      id: result.id,
    };
  } catch (error) {
    console.error("Error in createBanner:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
