"use server";

import { Banner, UsageContext } from "./bannerType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { unstable_cache } from "next/cache";

// Common cache configuration
const CACHE_CONFIG = {
  tags: ["banners", "usage_contexts"],
  revalidate: 3600, // 1 hour
};

export const getUniqueBanners = unstable_cache(
  async (): Promise<Banner[]> => {
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

      return await Promise.all(
        banners.map(async (banner: any) => ({
          ...banner,
          image: banner.image
            ? await compressAndEncodeBase64(banner.image)
            : undefined,
        }))
      );
    });
  },
  ["getUniqueBanners"],
  CACHE_CONFIG
);

export const fetchBannerById = unstable_cache(
  async (banner_id: number): Promise<Banner | null> => {
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
        return null;
      }

      const banner = rows[0];
      return {
        banner_id: banner.banner_id,
        title: banner.title,
        description: banner.description,
        link: banner.link,
        image: banner.image
          ? await compressAndEncodeBase64(banner.image)
          : undefined, // Ensure this is undefined (not null) if no image
        text_color: banner.text_color,
        background_color: banner.background_color,
        status: banner.status,
        usage_context_id: banner.usage_context_id,
        usage_context_name: banner.usage_context_name,
        context_type: banner.context_type,
        new_context_name: banner.new_context_name,
      } as Banner; // Explicit type assertion
    });
  },
  ["fetchBannerById"],
  {
    ...CACHE_CONFIG,
    revalidate: 600,
  }
);

export const fetchBannersByContext = unstable_cache(
  async (context_name: string): Promise<Banner[]> => {
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
        return [];
      }

      return await Promise.all(
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
    });
  },
  ["fetchBannersByContext"],
  {
    ...CACHE_CONFIG,
    // Context-specific banners might change more frequently
    revalidate: 1800, // 30 minutes
  }
);

export const fetchUsageContexts = unstable_cache(
  async (): Promise<UsageContext[]> => {
    return await dbOperation(async (connection) => {
      const [contexts] = await connection.execute(
        `SELECT context_id, name FROM usage_contexts`
      );

      if (!contexts || contexts.length === 0) {
        return [];
      }

      return contexts.map((context: UsageContext) => ({
        context_id: context.context_id,
        name: context.name,
      }));
    });
  },
  ["fetchUsageContexts"],
  {
    ...CACHE_CONFIG,
    // Usage contexts rarely change, so cache longer
    revalidate: 86400, // 24 hours
  }
);
