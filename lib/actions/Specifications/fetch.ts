"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export interface Specification {
  specification_id: number;
  specification_name: string;
}

// Function to fetch specifications for a product
export async function fetchSpecificationByProductId(
  productId: string
): Promise<Specification[]> {
  return await dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `SELECT s.specification_id, s.specification_name
       FROM specifications s
       JOIN category_specifications cs ON s.specification_id = cs.specification_id
       JOIN products p ON cs.category_id = p.category_id
       WHERE p.product_id = ?`,
      [productId]
    );

    if (!rows || rows.length === 0) {
      return []; // Return an empty array if no specifications are found
    }

    // Map the rows to the Specification interface
    const specifications: Specification[] = rows.map((row: any) => ({
      specification_id: row.specification_id,
      specification_name: row.specification_name,
    }));

    console.log(specifications); // Debugging

    return specifications;
  });
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
