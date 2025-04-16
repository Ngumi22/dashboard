"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function deleteBrandAction(brand_id: number): Promise<boolean> {
  return await dbOperation(async (connection) => {
    try {
      // Check if the brand exists in the database
      const [existingBrand]: any = await connection.execute(
        `SELECT * FROM brands WHERE brand_id = ? LIMIT 1`,
        [brand_id]
      );

      if (existingBrand.length === 0) {
        console.log(`Brand with ID ${brand_id} does not exist.`);
        return false; // Brand does not exist
      }

      // Delete the brand from the database
      await connection.query(`DELETE FROM brands WHERE brand_id = ?`, [
        brand_id,
      ]);

      return true; // Deletion successful
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw new Error("Failed to delete brand");
    }
  });
}
