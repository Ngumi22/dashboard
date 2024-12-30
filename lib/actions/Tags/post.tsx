"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { NextResponse } from "next/server";

export async function createProductTags(formData: FormData, productId: number) {
  try {
    // Extract tags from FormData ("tags" contains an array of strings)
    const tagsString = formData.get("tags");

    if (!tagsString) {
      return NextResponse.json({
        success: false,
        message: "No tags provided",
      });
    }

    // Parse tagsString to get an array of strings
    const tagsArray: string[] = JSON.parse(tagsString.toString());

    if (!Array.isArray(tagsArray) || tagsArray.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid tags provided",
      });
    }

    // Remove duplicates and trim whitespace
    const uniqueTags = Array.from(
      new Set(tagsArray.map((tag) => tag.trim()).filter((tag) => tag))
    );

    return dbOperation(async (connection) => {
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

      return NextResponse.json({
        success: true,
        message: "Product tags inserted successfully",
      });
    });
  } catch (error) {
    console.error("Error in createProductTags:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the tags",
      },
      { status: 500 }
    );
  }
}
