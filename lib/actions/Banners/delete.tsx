"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

// Function to delete a banner
export async function deleteBanner(banner_id: number): Promise<boolean> {
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

    return true; // Deletion successful
  });
}
