"use server";

import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";

export async function getUniqueTags() {
  const connection = await getConnection();
  try {
    const [tags] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT t.tag_name FROM tags t JOIN product_tags pt ON t.tag_id = pt.tag_id`);
    const uniqueTags = tags.map((tag) => tag.tag_name);
    const result = { uniqueTags };
    return result;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  } finally {
    connection.release();
  }
}
