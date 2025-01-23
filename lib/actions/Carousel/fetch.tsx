"use server";

import { cache, CacheUtil } from "@/lib/cache"; // Import CacheUtil
import { Carousel } from "./carouselType";
import { compressAndEncodeBase64 } from "../utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueCarousels(): Promise<Carousel[]> {
  const cacheKey = "carousels";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Carousel[]; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      // Fetch the most recently inserted carousels
      const [carousels] = await connection.query(
        `SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
         FROM carousels
         ORDER BY carousel_id DESC
         LIMIT 4` // Fetch only the latest entries
      );

      // Return an empty array if no carousels found
      if (!carousels || carousels.length === 0) {
        cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
        return [];
      }

      // Map the result and compress the image for each carousel
      const uniqueCarousels: Carousel[] = await Promise.all(
        carousels.map(async (carousel: any) => ({
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
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return uniqueCarousels;
    } catch (error) {
      console.error("Error fetching unique carousels:", error);
      throw error;
    }
  });
}

export async function fetchCarouselById(
  carousel_id: number
): Promise<Carousel | null> {
  const cacheKey = `carousel_${carousel_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Carousel; // Return cached data as Banner
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      // Query the database
      const [rows] = await connection.query(
        `SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
         FROM carousels WHERE carousel_id = ?`,
        [carousel_id]
      );

      if (!rows || rows.length === 0) {
        return null; // Return null if no banner is found
      }

      // Map database results to a carousel object
      const carousel = rows[0];
      const processedCarousel: any = {
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
      };

      cache.set(cacheKey, {
        value: processedCarousel,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return processedCarousel;
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Failed to fetch carousel");
    }
  });
}

export async function deleteCarousel(carousel_id: number): Promise<boolean> {
  const cacheKey = `carousel_${carousel_id}`;

  // Check if the carousel exists in the cache using CacheUtil
  const cachedData = cache.get(cacheKey);

  // If the cached data is valid, delete it from the cache
  if (cachedData) {
    cache.delete(cacheKey); // Delete expired or valid cached entry
  }

  return await dbOperation(async (connection) => {
    try {
      // Check if the carousel exists in the database
      const [rows] = await connection.query(
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

      cache.delete("carousels");
      cache.delete(cacheKey);

      return true; // Deletion successful
    } catch (error) {
      console.error("Error deleting carousel:", error);
      throw new Error("Failed to delete carousel");
    }
  });
}
