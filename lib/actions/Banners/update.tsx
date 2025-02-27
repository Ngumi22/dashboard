"use server";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { fileToBuffer } from "@/lib/utils";
import { bannerSchema } from "@/lib/ZodSchemas/bannerschema";

export const updateBannerAction = async (
  banner_id: string,
  formData: FormData
) => {
  try {
    // Validate and coerce incoming form data using Zod
    const validatedData = bannerSchema.parse(Object.fromEntries(formData));
    const {
      title,
      description,
      link,
      image,
      text_color,
      background_color,
      status,
      context_type,
      usage_context_id, // this is now a number (if provided) due to z.coerce.number()
      new_context_name,
    } = validatedData;

    if (!banner_id) {
      throw new Error("Banner ID is required.");
    }

    // Fetch the existing banner
    const existingBanner: any = await dbOperation(async (connection) => {
      const [banner]: any = await connection.execute(
        `SELECT * FROM banners WHERE banner_id = ? LIMIT 1`,
        [banner_id]
      );
      return banner.length > 0 ? banner[0] : null;
    });

    if (!existingBanner) {
      throw new Error("Banner not found.");
    }

    // Ensure that the existing usage_context_id is a number for proper comparison
    const existingUsageContextId = Number(existingBanner.usage_context_id);

    let updates: string[] = [];
    let values: any[] = [];
    let hasChanges = false;

    if (title && title !== existingBanner.title) {
      updates.push("title = ?");
      values.push(title);
      hasChanges = true;
    }

    if (description && description !== existingBanner.description) {
      updates.push("description = ?");
      values.push(description);
      hasChanges = true;
    }

    if (link && link !== existingBanner.link) {
      updates.push("link = ?");
      values.push(link);
      hasChanges = true;
    }

    if (text_color && text_color !== existingBanner.text_color) {
      updates.push("text_color = ?");
      values.push(text_color);
      hasChanges = true;
    }

    if (
      background_color &&
      background_color !== existingBanner.background_color
    ) {
      updates.push("background_color = ?");
      values.push(background_color);
      hasChanges = true;
    }

    if (status && status !== existingBanner.status) {
      updates.push("status = ?");
      values.push(status);
      hasChanges = true;
    }

    if (context_type === "existing") {
      // usage_context_id is a number (thanks to Zod coercion)
      if (usage_context_id !== existingUsageContextId) {
        // Check that the context exists
        const existingContext: any = await dbOperation(async (connection) => {
          const [context]: any = await connection.execute(
            `SELECT context_id FROM usage_contexts WHERE context_id = ? LIMIT 1`,
            [usage_context_id]
          );
          return context.length > 0 ? context[0] : null;
        });
        if (!existingContext) {
          throw new Error("Selected usage context does not exist.");
        }
        updates.push("usage_context_id = ?");
        values.push(usage_context_id);
        hasChanges = true;
      }
    } else if (context_type === "new") {
      const insertedContext: any = await dbOperation(async (connection) => {
        const [result]: any = await connection.execute(
          `INSERT INTO usage_contexts (name) VALUES (?)`,
          [new_context_name]
        );
        return result.insertId ? result.insertId : null;
      });
      if (!insertedContext) {
        throw new Error("Failed to create new usage context.");
      }
      if (insertedContext !== existingUsageContextId) {
        updates.push("usage_context_id = ?");
        values.push(insertedContext);
        hasChanges = true;
      }
    }

    if (image instanceof File && image.size > 0) {
      const imageBuffer = await fileToBuffer(image);
      updates.push("image = ?");
      values.push(imageBuffer);
      hasChanges = true;
    }

    if (!hasChanges) {
      throw new Error("No changes detected.");
    }

    await dbOperation(async (connection) => {
      const query = `UPDATE banners SET ${updates.join(
        ", "
      )} WHERE banner_id = ?`;
      await connection.execute(query, [...values, banner_id]);
    });

    return { success: true, message: "Banner updated successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
