"use server";

import { cache } from "@/lib/cache"; // Import CacheUtil
import { Carousel } from "./carouselType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { CACHE_TTL } from "@/lib/Constants";

export interface MiniCarousel {
  carousel_id: number;
  title: string;
  short_description: string;
  description: string;
  link: string;
  image: string;
  status: "active" | "inactive";
}

export async function getUniqueCarousels({
  limit = 4,
  status = "active",
}: {
  limit?: number;
  status?: "active" | "inactive" | "all";
} = {}): Promise<Carousel[]> {
  const cacheKey = `carouselsData`; // Unique cache key based on status and limit

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Carousel[]; // Return cached data
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      // Construct the SQL query dynamically based on status
      let query = `
        SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
        FROM carousels
      `;

      if (status !== "all") {
        query += ` WHERE status = ?`;
      }

      query += ` ORDER BY carousel_id DESC LIMIT ?`;

      // Execute the query with parameters
      const [carousels] = await connection.query(
        query,
        status !== "all" ? [status, limit] : [limit]
      );

      // Return an empty array if no carousels found
      if (!carousels || carousels.length === 0) {
        cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 24 }); // Cache empty result
        return [];
      }

      // Parallelize image compression for all carousels
      const uniqueCarousels: Carousel[] = await Promise.all(
        carousels.map(async (carousel: any) => ({
          carousel_id: String(carousel.carousel_id),
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
        expiry: Date.now() + CACHE_TTL,
      });

      return uniqueCarousels;
    } catch (error) {
      console.error("Error fetching unique carousels:", error);
      throw new Error("Failed to fetch carousels");
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
        carousel_id: String(carousel.carousel_id),
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
        expiry: Date.now() + CACHE_TTL,
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

export async function fetchCarousels(): Promise<MiniCarousel[]> {
  const cacheKey = `carouselsData`; // Unique cache key based on status and limit

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as MiniCarousel[]; // Return cached data
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    try {
      const [rows] = await connection.query(
        `SELECT
            carousel_id,
            title,
            short_description,
            description,
            link,
            image,
            status
        FROM carousels
        WHERE status = 'active'
        ORDER BY carousel_id DESC;`
      );

      // Return an empty array if no carousels found
      if (!rows || rows.length === 0) {
        cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 24 }); // Cache empty result
        return [];
      }

      // Parallelize image compression for all carousels
      const uniqueCarousels: MiniCarousel[] = await Promise.all(
        rows.map(async (carousel: any) => ({
          carousel_id: carousel.carousel_id,
          title: carousel.title,
          short_description: carousel.short_description,
          description: carousel.description,
          link: carousel.link,
          image: carousel.image
            ? await compressAndEncodeBase64(carousel.image)
            : null, // Compress image if it exists
          status: carousel.status,
        }))
      );

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: uniqueCarousels,
        expiry: Date.now() + CACHE_TTL,
      });

      return uniqueCarousels;
    } catch (error) {
      console.error("Error fetching unique carousels:", error);
      throw new Error("Failed to fetch carousels");
    }
  });
}
