"use server";

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

export type Carousel = {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string | null;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
};

export async function getUniqueCarousel() {
  const cacheKey = "unique_carousels";

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
    // Fetch the most recently inserted carousel
    const [carousels] = await connection.query<RowDataPacket[]>(
      `SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
       FROM carousels
       ORDER BY carousel_id DESC
       LIMIT 4` // Fetch only the latest entries
    );

    if (carousels.length === 0) {
      return null; // Return null if no carousel exists
    }

    // Map the result and compress the image for each carousel
    const uniqueCarousels: Carousel[] = await Promise.all(
      carousels.map(async (carousel) => ({
        carousel_id: carousel.carousel_id,
        title: carousel.title,
        short_description: carousel.short_description,
        description: carousel.description,
        link: carousel.link,
        image: carousel.image
          ? await compressAndEncodeBase64(carousel.image)
          : null, // Compress image if it exists
        status: carousel.status,
        text_color: carousel.text_color,
        background_color: carousel.background_color,
      }))
    );

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueCarousels,
      expiry: Date.now() + 3600 * 10,
    });

    return uniqueCarousels;
  } catch (error) {
    console.error("Error fetching unique carousels:", error);
    throw error;
  } finally {
    connection.release();
  }
}
