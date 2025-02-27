"use server";

import { revalidatePath } from "next/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { cache } from "@/lib/cache";

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
