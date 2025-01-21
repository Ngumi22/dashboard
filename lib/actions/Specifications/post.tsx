"use server";

import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { getErrorMessage } from "@/lib/utils";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function createProductSpecifications(
  data: FormData,
  productId: number,
  categoryId: number
) {
  if (!categoryId) {
    throw new Error("Category ID is required to add specifications.");
  }

  if (!productId) {
    throw new Error("Product ID is required to associate specifications.");
  }

  const specifications = Object.keys(Object.fromEntries(data.entries()))
    .filter((key) => key.startsWith("specifications["))
    .map((key) => {
      const specData = data.get(key)?.toString();
      try {
        const parsed = JSON.parse(specData || "{}");

        if (
          parsed &&
          parsed.specification_name &&
          parsed.specification_value &&
          parsed.category_id
        ) {
          parsed.category_id = Number(parsed.category_id);
          return parsed;
        } else {
          console.warn(`Invalid specification:`, parsed);
          return null;
        }
      } catch (error) {
        console.error(`Error parsing specification for key ${key}:`, error);
        return null;
      }
    })
    .filter((spec) => spec !== null);

  // Log parsed specifications for debugging
  if (specifications.length === 0) {
    throw new Error("No valid specifications provided.");
  }

  return await dbOperation(async (connection) => {
    try {
      const specificationIds: number[] = [];

      // Check if specifications exist or insert them
      for (const spec of specifications) {
        const [existingSpec]: [RowDataPacket[], FieldPacket[]] =
          await connection.query(
            `SELECT specification_id FROM specifications WHERE specification_name = ? LIMIT 1`,
            [spec.specification_name]
          );

        let specificationId: number;

        if (existingSpec.length > 0) {
          // Specification exists, use its ID
          specificationId = existingSpec[0].specification_id;
        } else {
          // Specification does not exist, insert it and get the ID
          const [insertResult]: [any, any] = await connection.query(
            `INSERT INTO specifications (specification_name) VALUES (?)`,
            [spec.specification_name]
          );
          specificationId = insertResult.insertId; // Access insertId from ResultSetHeader
        }

        specificationIds.push(specificationId);

        // Insert into category_specifications table
        await connection.query(
          `INSERT IGNORE INTO category_specifications (category_id, specification_id) VALUES (?, ?)`,
          [categoryId, specificationId]
        );
      }

      // Insert into product_specifications table
      const productSpecInsertValues = specifications.map((spec, index) => [
        productId,
        specificationIds[index],
        spec.specification_value,
      ]);

      await connection.query(
        `INSERT INTO product_specifications (product_id, specification_id, value) VALUES ?`,
        [productSpecInsertValues]
      );

      await connection.commit(); // Commit the transaction if all queries succeed
    } catch (error) {
      await connection.rollback(); // Rollback if any error occurs
      console.error("Error adding specifications:", getErrorMessage(error)); // Use getErrorMessage to handle the error
      throw new Error(getErrorMessage(error)); // Throw a more readable error message
    } finally {
      connection.release(); // Release the connection
    }
  });
}
