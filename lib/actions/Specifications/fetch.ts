"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export interface Specification {
  specification_id: number;
  specification_name: string;
}

export async function getSpecificationsForProduct(productId: string) {
  if (!productId) {
    console.error("Invalid product ID:", productId);
    return [];
  }

  try {
    const specifications = await dbOperation(async (connection) => {
      const [rows] = await connection.query(
        `SELECT s.specification_id, s.specification_name
         FROM specifications s
         JOIN category_specifications cs ON s.specification_id = cs.specification_id
         JOIN products p ON cs.category_id = p.category_id
         WHERE p.product_id = ?`,
        [productId]
      );

      return rows;
    });

    return specifications;
  } catch (error) {
    console.error("Failed to fetch specifications:", error);
    return [];
  }
}
