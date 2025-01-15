"use server";

import sharp from "sharp";
import { cache, setCache } from "@/lib/cache";
import { RowDataPacket } from "mysql2/promise";
import { getConnection } from "@/lib/MysqlDB/initDb";
import { Carousel } from "./carouselType";

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

export async function getUniqueCarousels() {
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
      console.log("No carousels in the database");
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

export async function fetchCarouselById(carousel_id: number) {
  const cacheKey = `carousel_${carousel_id}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Query the database
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
       FROM carousels WHERE carousel_id = ?`,
      [carousel_id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      return null;
    }

    // Map database results to a Category object
    const carousel: Carousel = {
      carousel_id: rows[0].carousel_id,
      title: rows[0].title,
      short_description: rows[0].short_description,
      description: rows[0].description,
      link: rows[0].link,
      image: rows[0].image
        ? await compressAndEncodeBase64(rows[0].image)
        : null, // Compress image if it exists
      status: rows[0].status,
      text_color: rows[0].text_color,
      background_color: rows[0].background_color,
    };

    setCache(cacheKey, carousel, { ttl: 300 }); // Cache for 5 minutes

    return carousel;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch carousel");
  } finally {
    connection.release();
  }
}

export async function deleteCarousel(carousel_id: number): Promise<boolean> {
  const cacheKey = `carousel_${carousel_id}`;

  // Check if the carousel exists in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);

    // If the cached data is valid, delete it from the cache
    if (cachedData && Date.now() < cachedData.expiry) {
      cache.delete(cacheKey);
    }
  }

  const connection = await getConnection();
  try {
    // Check if the carousel exists in the database
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM carousels WHERE carousel_id = ?`,
      [carousel_id]
    );

    if (rows.length === 0) {
      console.log(`Carousel with ID ${carousel_id} does not exist.`);
      return false; // Carousel does not exist
    }

    // Delete the carousel from the database
    await connection.query(`DELETE FROM carousels WHERE carousel_id = ?`, [
      carousel_id,
    ]);

    console.log(`Carousel with ID ${carousel_id} successfully deleted.`);
    return true; // Deletion successful
  } catch (error) {
    console.error("Error deleting carousel:", error);
    throw new Error("Failed to delete carousel");
  } finally {
    connection.release();
  }
}
