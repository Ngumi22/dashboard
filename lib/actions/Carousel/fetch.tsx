"use server";

import { Carousel } from "./carouselType";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

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

      return processedCarousel;
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error("Failed to fetch carousel");
    }
  });
}

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

export async function fetchCarousels(): Promise<MiniCarousel[]> {
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

      return uniqueCarousels;
    } catch (error) {
      console.error("Error fetching unique carousels:", error);
      throw new Error("Failed to fetch carousels");
    }
  });
}
