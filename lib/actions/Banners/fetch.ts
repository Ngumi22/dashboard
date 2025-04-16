"use server";

import { Banner, UsageContext } from "./bannerType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

// Function to fetch unique banners
// In your fetch.ts
export async function getUniqueBanners(): Promise<Banner[]> {
  return await dbOperation(async (connection) => {
    const [banners] = await connection.query(`
      SELECT
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
      INNER JOIN usage_contexts ON banners.usage_context_id = usage_contexts.context_id
      WHERE banners.deleted_at IS NULL
      ORDER BY banner_id DESC
    `);

    if (!banners || banners.length === 0) return [];

    // Process images in parallel
    return await Promise.all(
      banners.map(async (banner: any) => ({
        ...banner,
        image: banner.image
          ? await compressAndEncodeBase64(banner.image)
          : null,
      }))
    );
  });
}

// Function to fetch a banner by ID
export async function fetchBannerById(
  banner_id: number
): Promise<Banner | null> {
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
    const processedBanner: any = {
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

    return processedBanner;
  });
}

export async function fetchBannersByContext(
  context_name: string
): Promise<Banner[]> {
  return await dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `SELECT
          b.banner_id,
          b.title,
          b.description,
          b.link,
          b.image,
          b.text_color,
          b.background_color,
          b.status,
          b.related_id,
          b.usage_context_id,
          uc.name AS usage_context_name
      FROM banners AS b
      INNER JOIN usage_contexts AS uc
          ON b.usage_context_id = uc.context_id
      WHERE LOWER(uc.name) = LOWER(?)
        AND b.deleted_at IS NULL
      ORDER BY b.banner_id DESC;`,
      [context_name]
    );

    if (!rows || rows.length === 0) {
      return []; // Return an empty array if no banners are found
    }

    const processedBanners: Banner[] = await Promise.all(
      rows.map(async (banner: any) => ({
        banner_id: banner.banner_id,
        title: banner.title,
        description: banner.description,
        link: banner.link,
        image: banner.image
          ? await compressAndEncodeBase64(banner.image)
          : undefined,
        text_color: banner.text_color,
        background_color: banner.background_color,
        status: banner.status,
        related_id: banner.related_id,
        usage_context_id: banner.usage_context_id,
        usage_context_name: banner.usage_context_name,
      }))
    );

    return processedBanners;
  });
}

export async function fetchUsageContexts() {
  return await dbOperation(async (connection) => {
    const [contexts] = await connection.execute(
      `SELECT context_id, name FROM usage_contexts`
    );
    // Return an empty array if no contexts found
    if (!contexts || contexts.length === 0) {
      return [];
    }

    // Process contexts and cache them
    const data: UsageContext[] = await Promise.all(
      contexts.map(async (context: UsageContext) => ({
        context_id: context.context_id,
        name: context.name,
      }))
    );

    return data;
  });
}
