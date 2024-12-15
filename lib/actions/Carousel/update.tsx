"use server";

import { fileToBuffer } from "@/lib/utils";
import { getConnection } from "@/lib/database";
import { cache } from "@/lib/cache";

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string | File | null;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export async function updateCarouselAction(
  carousel_id: string,
  formData: FormData
) {
  const uniqueCarouselCacheKey = "unique_carousel";
  const carouselCacheKey = `carousel_${carousel_id}`;

  const connection = await getConnection();
  try {
    const carouselTitle = formData.get("title");
    const shortDescription = formData.get("short_description");
    const carouselDescription = formData.get("description");
    const carouselLink = formData.get("link");
    const Text_Color = formData.get("text_color");
    const Background_Color = formData.get("background_color");
    const status = formData.get("status");
    const newImageFile = formData.get("image");

    const updates: string[] = [];
    const values: any[] = [];

    if (carouselTitle) {
      updates.push("title = ?");
      values.push(carouselTitle);
    }

    if (shortDescription) {
      updates.push("short_description = ?");
      values.push(shortDescription);
    }

    if (carouselDescription) {
      updates.push("description = ?");
      values.push(carouselDescription);
    }

    if (carouselLink) {
      updates.push("link = ?");
      values.push(carouselLink);
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
      UPDATE carousels
      SET ${updates.join(", ")}
      WHERE carousel_id = ?;
    `;
    values.push(carousel_id);

    const [result]: [any, any] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error("Failed to update carousel. carousel might not exist.");
    }

    // Clear caches
    cache.delete(carouselCacheKey);
    cache.delete(uniqueCarouselCacheKey);

    return { success: true, message: "carousel updated successfully." };
  } catch (error: any) {
    console.error("Error updating carousel:", error);
    return {
      success: false,
      error: error.message || "Failed to update carousel.",
    };
  } finally {
    connection.release();
  }
}
