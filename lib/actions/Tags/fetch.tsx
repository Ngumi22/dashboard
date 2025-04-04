"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

type Tag = {
  tag_name: string;
};

export async function getUniqueTags() {
  return await dbOperation(async (connection) => {
    try {
      const [tags] = await connection.query(`
        SELECT DISTINCT t.tag_name FROM tags t
        JOIN product_tags pt ON t.tag_id = pt.tag_id
      `);

      const uniqueTags = tags.map((tag: { tag_name: any }) => tag.tag_name);
      const result = { uniqueTags };

      return result;
    } catch (error) {
      console.error("Error fetching unique tags:", error);
      throw error;
    } finally {
      connection.release();
    }
  });
}

export async function getProductTags(product_id: number) {
  return await dbOperation(async (connection) => {
    try {
      const [tags] = await connection.query(
        `
        SELECT
            t.tag_name
        FROM
            product_tags pt
        JOIN
            tags t ON pt.tag_id = t.tag_id
        WHERE
            pt.product_id = ?;`,
        [product_id]
      );

      // Extract unique tag names (if needed, though DISTINCT is not required in the query)
      const uniqueTags = Array.from(
        new Set(tags.map((tag: Tag) => tag.tag_name))
      );
      const result = { uniqueTags };

      return result;
    } catch (error) {
      console.error("Error fetching product tags:", error);
      throw error; // Re-throw the error for the caller to handle
    } finally {
      connection.release(); // Ensure the connection is always released
    }
  });
}
