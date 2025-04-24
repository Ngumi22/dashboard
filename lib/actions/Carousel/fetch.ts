"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { Carousel } from "./carouselTypes";
import { unstable_cache } from "next/cache";

export const getUniqueCarousels = unstable_cache(
  async ({
    limit = 4,
    status = "active",
  }: {
    limit?: number;
    status?: "active" | "inactive" | "all";
  } = {}): Promise<Carousel[]> => {
    return await dbOperation(async (connection) => {
      try {
        let query = `
          SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
          FROM carousels
        `;

        if (status !== "all") {
          query += ` WHERE status = ?`;
        }

        query += ` ORDER BY carousel_id DESC LIMIT ?`;

        const [carousels] = await connection.query(
          query,
          status !== "all" ? [status, limit] : [limit]
        );

        if (!carousels || carousels.length === 0) return [];

        return await Promise.all(
          carousels.map(async (carousel: any) => ({
            ...carousel,
            image: carousel.image
              ? await compressAndEncodeBase64(carousel.image)
              : null,
          }))
        );
      } catch (error) {
        console.error("Error fetching unique carousels:", error);
        throw new Error("Failed to fetch carousels");
      }
    });
  },
  ["getUniqueCarousels"],
  {
    tags: ["carousels"],
    revalidate: 3600, // Revalidate every hour
  }
);

export const fetchCarouselById = unstable_cache(
  async (carousel_id: number): Promise<Carousel | null> => {
    return await dbOperation(async (connection) => {
      try {
        const [rows] = await connection.query(
          `SELECT carousel_id, title, short_description, description, link, image, status, text_color, background_color
           FROM carousels WHERE carousel_id = ?`,
          [carousel_id]
        );

        if (!rows || rows.length === 0) {
          return null;
        }

        const carousel = rows[0];
        const processedCarousel: any = {
          carousel_id: String(carousel.carousel_id),
          title: carousel.title,
          short_description: carousel.short_description,
          description: carousel.description,
          link: carousel.link,
          image: carousel.image
            ? await compressAndEncodeBase64(carousel.image)
            : null,
          status: carousel.status,
          text_color: carousel.text_color,
          background_color: carousel.background_color,
        };

        return processedCarousel;
      } catch (error) {
        console.error("Database query error:", error);
        throw new Error("Failed to fetch carousel");
      }
    });
  },
  ["fetchCarouselById"],
  {
    tags: ["carousels"],
    revalidate: 3600, // Revalidate every hour
  }
);
export async function deleteCarousel(carousel_id: number): Promise<boolean> {
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

      return true; // Deletion successful
    } catch (error) {
      console.error("Error deleting carousel:", error);
      throw new Error("Failed to delete carousel");
    }
  });
}
