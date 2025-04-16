"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function createProductTags(formData: FormData, productId: number) {
  return dbOperation(async (connection) => {
    try {
      // Extract tags from FormData ("tags" contains an array of strings)
      const tagsString = formData.get("tags");

      if (!tagsString) {
        throw new Error("No tags provided");
      }

      // Parse tagsString to get an array of strings
      const tagsArray: string[] = JSON.parse(tagsString.toString());

      if (!Array.isArray(tagsArray) || tagsArray.length === 0) {
        throw new Error("No valid tags provided");
      }

      // Remove duplicates and trim whitespace
      const uniqueTags = Array.from(
        new Set(tagsArray.map((tag) => tag.trim()).filter((tag) => tag))
      );

      const tagIds: number[] = [];

      for (const tagName of uniqueTags) {
        const [tagRows] = await connection.query(
          "SELECT tag_id FROM tags WHERE tag_name = ? FOR UPDATE",
          [tagName]
        );

        let tagId: number;

        if (tagRows.length === 0) {
          const [tagResult]: [any, any] = await connection.query(
            "INSERT INTO tags (tag_name) VALUES (?)",
            [tagName]
          );
          tagId = tagResult.insertId; // Get the inserted tag ID
        } else {
          tagId = tagRows[0].tag_id;
        }

        tagIds.push(tagId);
      }

      // Insert into product_tags table
      const productTagRelations = tagIds.map((tagId) => [productId, tagId]);

      await connection.query(
        "INSERT IGNORE INTO product_tags (product_id, tag_id) VALUES ?",
        [productTagRelations]
      );

      return {
        success: true,
        message: "Product tags inserted successfully",
      };
    } catch (error) {
      console.error("Error in createProductTags:", error);
      throw error;
    }
  });
}
