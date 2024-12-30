"use server";

import sharp from "sharp";
import { cache, setCache } from "@/lib/cache";
import { RowDataPacket } from "mysql2/promise";
import { getConnection } from "@/lib/MysqlDB/initDb";
import { Banner } from "./bannerType";

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
      `SELECT banner_id, title, description, link, image, text_color, background_color, usage_context, status FROM banners ORDER BY banner_id DESC`
    );

    if (banners.length === 0) {
      return null; // Return null if no banners exists
    }

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
      expiry: Date.now() + 36 * 10, // 1 hour expiration
    });

    return uniqueBanners;
  } catch (error) {
    console.error("Error fetching unique banners:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchBannerById(banner_id: number) {
  const cacheKey = `banner_${banner_id}`;

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
      `SELECT banner_id, title, description, link, image, text_color, background_color, status, usage_context
       FROM banners WHERE banner_id = ?`,
      [banner_id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      return null;
    }

    // Map database results to a Category object
    const banner: Banner = {
      banner_id: rows[0].banner_id,
      title: rows[0].title,
      description: rows[0].description,
      link: rows[0].link,
      image: rows[0].image
        ? await compressAndEncodeBase64(rows[0].image)
        : null, // Compress image if it exists
      text_color: rows[0].text_color,
      background_color: rows[0].background_color,
      status: rows[0].status,
      usage_context: rows[0].usage_context,
    };

    setCache(cacheKey, banner, { ttl: 60 }); // Cache for 1 minutes

    return banner;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch banner");
  } finally {
    connection.release();
  }
}

export async function deleteBanner(banner_id: number): Promise<boolean> {
  const cacheKey = `banner_${banner_id}`;

  // Check if the banner exists in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);

    // If the cached data is valid, delete it from the cache
    if (cachedData && Date.now() < cachedData.expiry) {
      cache.delete(cacheKey);
    }
  }

  const connection = await getConnection();
  try {
    // Check if the banner exists in the database
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM banners WHERE banner_id = ?`,
      [banner_id]
    );

    if (rows.length === 0) {
      console.log(`Banner with ID ${banner_id} does not exist.`);
      return false; // banner does not exist
    }

    // Delete the banner from the database
    await connection.query(`DELETE FROM banners WHERE banner_id = ?`, [
      banner_id,
    ]);

    console.log(`Banner with ID ${banner_id} successfully deleted.`);
    return true; // Deletion successful
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw new Error("Failed to delete banner");
  } finally {
    connection.release();
  }
}
