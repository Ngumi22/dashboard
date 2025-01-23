"use server";

import { Banner } from "./bannerType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { cache } from "@/lib/cache";
import { UsageContext } from "@/app/(backend)/dashboard/banners/banner";

// Function to fetch unique banners
export async function getUniqueBanners(): Promise<Banner[]> {
  const cacheKey = "banners";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Banner[]; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  // Query the database for banners if not in cache
  return await dbOperation(async (connection) => {
    const [banners] = await connection.query(
      `SELECT
          banners.banner_id,
          banners.title,
          banners.description,
          banners.link,
          banners.image,
          banners.text_color,
          banners.background_color,
          banners.status,
          banners.related_id,
          banners.usage_context_id,
          usage_contexts.name AS usage_context_name
      FROM banners
      INNER JOIN usage_contexts
      ON banners.usage_context_id = usage_contexts.context_id
      ORDER BY banner_id DESC`
    );

    // Return an empty array if no banners found
    if (!banners || banners.length === 0) {
      cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
      return [];
    }

    // Process the banners and cache them
    const uniqueBanners: Banner[] = await Promise.all(
      banners.map(async (banner: any) => ({
        banner_id: banner.banner_id,
        title: banner.title,
        description: banner.description,
        link: banner.link,
        image: banner.image
          ? await compressAndEncodeBase64(banner.image)
          : null,
        text_color: banner.text_color,
        background_color: banner.background_color,
        status: banner.status,
        related_id: banner.related_id,
        usage_context_id: banner.usage_context_id,
        usage_context_name: banner.usage_context_name,
      }))
    );

    cache.set(cacheKey, {
      value: uniqueBanners,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    return uniqueBanners;
  });
}

// Function to fetch a banner by ID
export async function fetchBannerById(
  banner_id: number
): Promise<Banner | null> {
  const cacheKey = `banner_${banner_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Banner; // Return cached data as Banner
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  return await dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `SELECT
          banners.banner_id,
          banners.title,
          banners.description,
          banners.link,
          banners.image,
          banners.text_color,
          banners.background_color,
          banners.status,
          banners.related_id,
          banners.usage_context_id,
          usage_contexts.name AS usage_context_name
      FROM banners
      INNER JOIN usage_contexts
      ON banners.usage_context_id = usage_contexts.context_id
      WHERE banner_id = ?`,
      [banner_id]
    );

    if (!rows || rows.length === 0) {
      return null; // Return null if no banner is found
    }

    const banner = rows[0];
    const processedBanner: Banner = {
      banner_id: banner.banner_id,
      title: banner.title,
      description: banner.description,
      link: banner.link,
      image: rows[0].image
        ? await compressAndEncodeBase64(rows[0].image)
        : undefined, // Convert null to undefined
      text_color: banner.text_color,
      background_color: banner.background_color,
      status: banner.status,
      usage_context_id: banner.usage_context_id,
      usage_context_name: banner.usage_context_name,
      context_type: banner.context_type,
      new_context_name: banner.new_context_name,
    };

    cache.set(cacheKey, {
      value: processedBanner,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });
    return processedBanner;
  });
}

export async function fetchUsageContexts() {
  const cacheKey = "contexts";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as UsageContext[]; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }
  return await dbOperation(async (connection) => {
    const [contexts] = await connection.execute(
      `SELECT context_id, name FROM usage_contexts`
    );
    // Return an empty array if no contexts found
    if (!contexts || contexts.length === 0) {
      cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
      return [];
    }

    // Process contexts and cache them
    const data: UsageContext[] = await Promise.all(
      contexts.map(async (context: UsageContext) => ({
        context_id: context.context_id,
        name: context.name,
      }))
    );
    // Cache the result with an expiry time using CacheUtil
    cache.set(cacheKey, {
      value: data,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    return data;
  });
}

// Function to delete a banner
export async function deleteBanner(banner_id: number): Promise<boolean> {
  const cacheKey = `banner_${banner_id}`;

  // Check if the carousel exists in the cache using CacheUtil
  const cachedData = cache.get(cacheKey);

  // If the cached data is valid, delete it from the cache
  if (cachedData) {
    cache.delete(cacheKey); // Delete expired or valid cached entry
  }

  return await dbOperation(async (connection) => {
    // Check if the banner exists in the database
    const [rows] = await connection.query(
      `SELECT * FROM banners WHERE banner_id = ?`,
      [banner_id]
    );

    if (rows.length === 0) {
      console.log(`Banner with ID ${banner_id} does not exist.`);
      return false; // Banner does not exist
    }

    // Delete the banner from the database
    await connection.query(`DELETE FROM banners WHERE banner_id = ?`, [
      banner_id,
    ]);

    console.log(`Banner with ID ${banner_id} successfully deleted.`);

    cache.delete(cacheKey);
    cache.delete("banners");

    return true; // Deletion successful
  });
}
