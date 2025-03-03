"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export const deleteBrandAction = async (brand_id: string) => {
  try {
    if (!brand_id) {
      throw new Error("Brand ID is required.");
    }

    // Fetch the existing brand
    const existingBrand: any = await dbOperation(async (connection) => {
      const [brand]: any = await connection.execute(
        `SELECT * FROM brands WHERE brand_id = ? LIMIT 1`,
        [brand_id]
      );
      return brand.length > 0 ? brand[0] : null;
    });

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    // Delete the brand (cascading will handle associated products and related data)
    await dbOperation(async (connection) => {
      await connection.execute(`DELETE FROM brands WHERE brand_id = ?`, [
        brand_id,
      ]);
    });

    console.log("Deleted brand_id", brand_id);

    return {
      success: true,
      message: "Brand and associated products deleted successfully.",
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
