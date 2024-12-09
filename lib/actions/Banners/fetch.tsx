"use server";

import { revalidatePath } from "next/cache";
import { dbOperation } from "./post";
import { fileToBuffer } from "@/lib/utils";
import sharp from "sharp";
import { cache } from "@/lib/cache";
import { getConnection } from "@/lib/database";
import { RowDataPacket } from "mysql2/promise";

async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    const compressedBuffer = await sharp(buffer)
      .resize(100) // Resize to 100px width (adjust as needed)
      .webp({ quality: 70 }) // Convert to WebP with 70% quality
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error:", error);
    return null;
  }
}

type Banner = {
  banner_id: number;
  title: string;
  description: string;
  link: string;
  image: string | null; // Adjusted to match function output
  text_color: string;
  background_color: string;
  status: string;
  usage_context: string;
};

export async function upsertCarousel(data: FormData) {
  const carouselId = data.get("carousel_id") as string | null;
  const title = data.get("title") as string;
  const short_description = data.get("short_description") as string;
  const button_text = data.get("button_text") as string;
  const button_link = data.get("button_link") as string;
  const position = parseInt(data.get("position") as string);
  const status = data.get("status") as "active" | "inactive";
  const image = data.get("image") as File | null;

  let imagePath = data.get("current_image") as Buffer | null;
  if (image instanceof File) {
    imagePath = await fileToBuffer(image);
  }

  try {
    const result = await dbOperation(async (connection) => {
      if (carouselId) {
        const [rows] = await connection.execute(
          `UPDATE carousels SET
           title = ?, short_description = ?, button_text = ?, button_link = ?,
           image = ?, position = ?, status = ?
           WHERE carousel_id = ?`,
          [
            title,
            short_description,
            button_text,
            button_link,
            imagePath,
            position,
            status,
            carouselId,
          ]
        );
        return { id: carouselId, affectedRows: (rows as any).affectedRows };
      } else {
        const [rows] = await connection.execute(
          `INSERT INTO carousels
           (title, short_description, button_text, button_link, image, position, status)
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
        return {
          id: (rows as any).insertId,
          affectedRows: (rows as any).affectedRows,
        };
      }
    });

    revalidatePath("/admin/carousels");
    return { success: true, id: result.id };
  } catch (error) {
    console.error("Failed to upsert carousel:", error);
    return { success: false, error: "Failed to upsert carousel" };
  }
}

export async function upsertBanner(data: FormData) {
  const bannerId = data.get("banner_id") as string | null;
  const title = data.get("title") as string;
  const description = data.get("description") as string;
  const link = data.get("link") as string;
  const text_color = data.get("text_color") as string;
  const background_color = data.get("background_color") as string;
  const status = data.get("status") as "active" | "inactive";
  const image = data.get("image") as File | null;
  const usage_context = data.get("usage_context") as string | null;

  let imagePath = data.get("current_image") as Buffer | null;
  if (image instanceof File) {
    imagePath = await fileToBuffer(image);
  }

  try {
    const result = await dbOperation(async (connection) => {
      if (bannerId) {
        const [rows] = await connection.execute(
          `UPDATE banners SET
           title = ?, description = ?, link = ?, image = ?,
           text_color = ?, background_color = ?, status = ?, usage_context = ?
           WHERE banner_id = ?`,
          [
            title,
            description,
            link,
            imagePath,
            text_color,
            background_color,
            status,
            bannerId,
            usage_context,
          ]
        );
        return { id: bannerId, affectedRows: (rows as any).affectedRows };
      } else {
        const [rows] = await connection.execute(
          `INSERT INTO banners
           (title, description, link, image, text_color, background_color, status, usage_context)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            description,
            link,
            imagePath,
            text_color,
            background_color,
            usage_context,
            status,
          ]
        );
        return {
          id: (rows as any).insertId,
          affectedRows: (rows as any).affectedRows,
        };
      }
    });

    revalidatePath("/dashboard/banners");
    return { success: true, id: result.id };
  } catch (error) {
    console.error("Failed to upsert banner:", error);
    return { success: false, error: "Failed to upsert banner" };
  }
}

export async function getUniqueBanners() {
  const cacheKey = "unique_banners";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Fetch all unique banners
    const [banners] = await connection.query<RowDataPacket[]>(
      `SELECT banner_id, title, description, link, image, text_color, background_color, usage_context, status FROM banners`
    );

    // Map the result and compress the image for each banner
    const uniqueBanners: Banner[] = await Promise.all(
      banners.map(async (banner) => ({
        banner_id: banner.banner_id,
        title: banner.title,
        description: banner.description,
        link: banner.link,
        image: banner.image
          ? await compressAndEncodeBase64(banner.image)
          : null, // Compress image if it exists
        text_color: banner.text_color,
        background_color: banner.background_color,
        status: banner.status,
        usage_context: banner.usage_context,
      }))
    );

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueBanners,
      expiry: Date.now() + 3600 * 10, // 1 hour expiration
    });

    return uniqueBanners;
  } catch (error) {
    console.error("Error fetching unique banners:", error);
    throw error;
  } finally {
    connection.release();
  }
}
