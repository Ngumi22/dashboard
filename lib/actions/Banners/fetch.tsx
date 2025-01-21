"use server";

import { Banner } from "./bannerType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { cache, CacheUtil } from "@/lib/cache";
import { UsageContext } from "@/app/(backend)/dashboard/banners/banner";

// Function to fetch unique banners
export async function getUniqueBanners() {
  const cacheKey = "banners";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  // If not found in cache, query the database
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
      FROM banners INNER JOIN usage_contexts ON
          banners.usage_context_id = usage_contexts.context_id
      ORDER BY banner_id DESC`
    );

    // If no banners found, cache an empty list
    if (banners.length === 0) {
      // CacheUtil.set(cacheKey, [], 36 * 10); // Cache expiry in seconds
      return [];
    }

    // Process banners and cache them
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

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueBanners,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    return uniqueBanners;
  });
}

// Function to fetch a banner by ID
export async function fetchBannerById(banner_id: number) {
  const cacheKey = `banner_${banner_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  // If not found in cache, query the database
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
          usage_contexts.name AS usage_context_name,
          banners.created_at,
          banners.updated_at,
          banners.deleted_at
      FROM banners INNER JOIN usage_contexts ON
          banners.usage_context_id = usage_contexts.context_id WHERE banner_id = ?`,
      [banner_id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      console.log(`No banners in the database`);
      return null;
    }

    // Process the banner data
    const banner: any = {
      banner_id: rows[0].banner_id,
      title: rows[0].title,
      description: rows[0].description,
      link: rows[0].link,
      image: rows[0].image
        ? await compressAndEncodeBase64(rows[0].image)
        : null,
      text_color: rows[0].text_color,
      background_color: rows[0].background_color,
      status: rows[0].status,
      usage_context_id: rows[0].usage_context_id,
      usage_context_name: rows[0].usage_context_name,
    };

    // Cache the banner for 1 minute
    CacheUtil.set(cacheKey, banner, 3600); // Cache expiry in seconds

    return banner;
  });
}

export async function fetchUsageContexts() {
  const cacheKey = "ontexts";

  // Check if the result is already in the cache using CacheUtil
  const cachedData = CacheUtil.get<UsageContext[]>(cacheKey);
  if (cachedData) {
    return cachedData; // Return cached data if it hasn't expired
  }
  return await dbOperation(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT context_id, name FROM usage_contexts`
    );
    if (rows.length === 0) {
      return null;
    }
    // Process banners and cache them
    const contexts = await Promise.all(
      rows.map(async (context: UsageContext) => ({
        context_id: context.context_id,
        name: context.name,
      }))
    );
    // Cache the result with an expiry time using CacheUtil
    CacheUtil.set(cacheKey, contexts, 3600); // Cache for 1 hour (3600 seconds)

    return contexts;
  });
}

// Function to delete a banner
export async function deleteBanner(banner_id: number): Promise<boolean> {
  const cacheKey = `banner_${banner_id}`;

  // Check if the carousel exists in the cache using CacheUtil
  const cachedData = CacheUtil.get<Banner>(cacheKey);

  // If the cached data is valid, delete it from the cache
  if (cachedData) {
    CacheUtil.delete(cacheKey); // Delete expired or valid cached entry
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

    // Invalidate cache for all carousels
    CacheUtil.invalidate("banners");
    CacheUtil.invalidate(cacheKey);

    return true; // Deletion successful
  });
}
