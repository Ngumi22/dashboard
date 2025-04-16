import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function fetchProductByName(productName: string) {
  return dbOperation(async (connection) => {
    try {
      const result = await connection.query(
        `SELECT * FROM products
          WHERE LOWER(product_name) = LOWER(${productName})`
      );

      if (result.rows.length === 0) {
        return null; // No product found
      }

      return result.rows[0]; // Return the first matching product
    } catch (error) {
      console.error("Error fetching product name:", error);
      throw error;
    }
  });
}
