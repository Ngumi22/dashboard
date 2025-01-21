"use server";

import { fileToBuffer } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { CacheUtil } from "@/lib/cache";

export async function updateBannerAction(
  banner_id: string,
  formData: FormData
) {
  const uniqueBannerCacheKey = `banner_${banner_id}`;
  CacheUtil.get(uniqueBannerCacheKey);

  return await dbOperation(async (connection) => {
    const updates: string[] = [];
    const values: any[] = [];
    let hasChanges = false;

    // Fields for banners table
    const fields = [
      "title",
      "description",
      "link",
      "text_color",
      "background_color",
      "status",
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== undefined && value !== "") {
        updates.push(`${field} = ?`);
        values.push(value);
        hasChanges = true;
      }
    }

    // Handle usage context
    const newContextName = formData.get("new_context_name") as string | null;
    const usageContextId = formData.get("usage_context_id") as string | null;

    if (newContextName) {
      // Create a new usage context and get its ID
      const [result]: [any, any] = await connection.execute(
        `INSERT INTO usage_contexts (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name), context_id = LAST_INSERT_ID(context_id)`,
        [newContextName]
      );
      const newContextId = result.insertId;

      updates.push("usage_context_id = ?");
      values.push(newContextId);
      hasChanges = true;
    } else if (usageContextId) {
      updates.push("usage_context_id = ?");
      values.push(usageContextId);
      hasChanges = true;
    } else {
      throw new Error(
        "Either 'usage_context_id' or 'new_context_name' must be provided."
      );
    }

    // Handle image upload
    const newImageFile = formData.get("image") as File | null;
    if (newImageFile && newImageFile.size > 0) {
      const newImageBuffer = await fileToBuffer(newImageFile);
      updates.push("image = ?");
      values.push(newImageBuffer);
      hasChanges = true;
    }

    if (!hasChanges) {
      return { success: false, message: "No updates were made." };
    }

    updates.push("updated_at = NOW()");
    const query = `
      UPDATE banners
      SET ${updates.join(", ")}
      WHERE banner_id = ?;
    `;
    values.push(banner_id);

    const [result]: [any, any] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error("Failed to update banner. Banner might not exist.");
    }

    // Invalidate the cache
    CacheUtil.invalidate(uniqueBannerCacheKey);

    return { success: true, message: "Banner updated successfully." };
  });
}
