"use server";

import { fileToBuffer } from "@/lib/utils";
import { cache } from "@/lib/cache";
import { getConnection } from "@/lib/MysqlDB/initDb";

export async function updateBannerAction(
  banner_id: string,
  formData: FormData
) {
  const uniqueBannerCacheKey = "unique_banner";
  const bannerCacheKey = `banner_${banner_id}`;

  const connection = await getConnection();
  try {
    const bannerTitle = formData.get("title");
    const bannerDescription = formData.get("description");
    const bannerLink = formData.get("link");
    const newImageFile = formData.get("image");
    const Text_Color = formData.get("text_color");
    const Background_Color = formData.get("background_color");
    const status = formData.get("status");
    const usageContext = formData.get("usage_context");

    const updates: string[] = [];
    const values: any[] = [];

    if (bannerTitle) {
      updates.push("title = ?");
      values.push(bannerTitle);
    }

    if (bannerDescription) {
      updates.push("description = ?");
      values.push(bannerDescription);
    }

    if (bannerLink) {
      updates.push("link = ?");
      values.push(bannerLink);
    }

    if (Text_Color) {
      updates.push("text_color = ?");
      values.push(Text_Color);
    }

    if (Background_Color) {
      updates.push("background_color = ?");
      values.push(Background_Color);
    }

    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (newImageFile) {
      const newImageBuffer = await fileToBuffer(newImageFile as File);
      updates.push("image = ?");
      values.push(newImageBuffer);
    }

    // Ensure we have fields to update
    if (updates.length === 0) {
      return { success: false, message: "No fields to update." };
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
      throw new Error("Failed to update banner. banner might not exist.");
    }

    // Clear caches
    cache.delete(bannerCacheKey);
    cache.delete(uniqueBannerCacheKey);

    return { success: true, message: "Banner updated successfully." };
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return {
      success: false,
      error: error.message || "Failed to update banner.",
    };
  } finally {
    connection.release();
  }
}
