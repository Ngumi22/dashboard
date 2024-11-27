"use server";
import { getConnection } from "./database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbsetupTables } from "./MysqlTables";
import { NewProductSchema } from "./ProductSchema";
import { CategorySchema } from "./ZodSchemas/categorySchema";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { fileToBuffer, getErrorMessage, parseNumberField } from "./utils";

// Helper function for database operations

export async function dbOperation<T>(
  operation: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    await dbsetupTables();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();

    const errorMessage = getErrorMessage(error);

    // Log the error to the server console
    console.error(`[Server Error]: ${errorMessage}`);

    // Optionally, send the error to a monitoring service like Sentry
    // Sentry.captureException(error);

    throw new Error(errorMessage); // Re-throw for handling in API routes
  } finally {
    connection.release();
  }
}

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function addBrand(formData: FormData) {
  const brandData = {
    brand_name: formData.get("brand_name"),
    brand_image: formData.get("brand_image"),
  };

  try {
    // Validate the input data (excluding image for now)
    const validatedData = NewProductSchema.pick({
      brand_name: true,
    }).parse(brandData);

    return dbOperation(async (connection) => {
      // Check if the brand already exists
      const [existingBrand] = await connection.query(
        "SELECT brand_id FROM brands WHERE brand_name = ?",
        [validatedData.brand_name]
      );

      if (existingBrand.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Brand already exists",
          brandId: existingBrand[0].brand_id,
        });
      }

      // Convert the brand image to buffer
      const brandImageBuffer = await fileToBuffer(
        brandData.brand_image as File // Ensure correct type
      );

      // Insert the new brand into the database
      const [result] = await connection.query(
        "INSERT INTO brands (brand_name, brand_image, created_by, updated_by) VALUES (?, ?, null, null)",
        [
          validatedData.brand_name,
          brandImageBuffer,
          parseNumberField(formData, "created_by"),
          parseNumberField(formData, "updated_by"),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Brand created successfully",
        brandId: result.insertId,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          message: `Validation error: ${errorMessages}`,
        },
        { status: 400 }
      );
    }

    if (error instanceof CustomError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error("Error in addBrand:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the brand",
      },
      { status: 500 }
    );
  }
}

export async function createProductImages(
  formData: FormData,
  productId: number
) {
  const imageData = {
    mainImage: formData.get("main_image"),
    thumbnails: formData.getAll("thumbnails"),
  };

  const validatedProductId = z.number().positive().parse(productId);

  return dbOperation(async (connection) => {
    const mainImageBuffer = await fileToBuffer(imageData.mainImage as File);

    const thumbnailBuffers = await Promise.all(
      (imageData.thumbnails as File[]).map((thumbnail) =>
        fileToBuffer(thumbnail)
      )
    );

    const [result] = await connection.query(
      `INSERT INTO product_images (product_id, main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [validatedProductId, mainImageBuffer, ...thumbnailBuffers]
    );
    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      imageId: result.insertId,
    });
  });
}

export async function createProductTags(formData: FormData, productId: number) {
  try {
    const tagsArray: Array<{ value: string }> = [];

    // Get all the keys from FormData
    const keys = Array.from(formData.keys());

    // Loop through the keys to extract tags
    keys.forEach((key) => {
      if (key.startsWith("tags[")) {
        const value = formData.get(key);
        if (value) {
          tagsArray.push(JSON.parse(value.toString()));
        }
      }
    });

    // Check if tagsArray is empty
    if (!tagsArray || tagsArray.length === 0) {
      return NextResponse.json({ success: false, message: "No tags provided" });
    }

    // Extract unique tag names
    const uniqueTags = Array.from(
      new Set(tagsArray.map((tag) => tag.value.trim()).filter((value) => value))
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

  const connection = await getConnection();
  await connection.beginTransaction(); // Start a transaction to ensure data consistency

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
}
