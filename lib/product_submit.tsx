"use server";

import { getConnection } from "./database";
import { z } from "zod";
import { schema } from "./formSchema";
import { dbsetupTables } from "./MysqlTables";
import {
  addCategory,
  addBrand,
  createSupplier,
  createProductImages,
  manageProductTags,
  createProductSpecifications,
} from "./product_actions";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

function parseJsonField(formData: FormData, key: string): any {
  const value = formData.get(key);
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      throw new Error(`Failed to parse ${key} data.`);
    }
  }
  return undefined;
}

function parseNumberField(formData: FormData, key: string): number | undefined {
  const value = formData.get(key);
  if (typeof value === "string") {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid ${key} data: not a number.`);
    }
    return parsedValue;
  }
  return undefined;
}

async function insertProduct(formData: Record<string, any>) {
  const connection = await getConnection();
  try {
    console.log("Starting product insertion...");
    const [result] = await connection.query(
      `INSERT INTO products (name, sku, description, price, quantity, discount, status, category_id, brand_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.name,
        formData.sku,
        formData.description,
        formData.price,
        formData.quantity,
        formData.discount,
        formData.status,
        formData.category_id,
        formData.brand_id,
        formData.created_by,
        formData.updated_by,
      ]
    );
    console.log("Product inserted successfully.");
    return (result as any).insertId;
  } catch (error) {
    console.error("Error inserting product:", error);
    throw error;
  }
}

export async function submitProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    console.log("Starting transaction...");
    await dbsetupTables();
    console.log("Tables checked/created.");

    const parsedData: Record<string, any> = {};

    // Parse JSON fields
    ["specificationData", "supplier", "tags", "category", "brand"].forEach(
      (field) => {
        parsedData[field] = parseJsonField(formData, field);
      }
    );

    // Parse number fields
    ["price", "quantity", "discount"].forEach((field) => {
      parsedData[field] = parseNumberField(formData, field);
    });

    // Handle images
    const mainImage = formData.get("mainImage") as File | null;
    const thumbnails = formData.getAll("thumbnails") as File[];
    parsedData.images = {
      mainImage: mainImage,
      thumbnails: thumbnails,
    };

    // Copy other fields
    Array.from(formData.keys()).forEach((key) => {
      if (!parsedData.hasOwnProperty(key)) {
        parsedData[key] = formData.get(key);
      }
    });

    // Validate the form data using Zod
    schema.parse(parsedData);

    // Perform all insertions
    const categoryResponse = await addCategory(formData);
    const categoryData = await categoryResponse.json();
    parsedData.category_id = categoryData.categoryId;

    const brandResponse = await addBrand(formData);
    const brandData = await brandResponse.json();
    parsedData.brand_id = brandData.brandId;

    const supplierResponse = await createSupplier(formData);
    const supplierData = await supplierResponse.json();

    const productId = await insertProduct(parsedData);

    await createProductImages(formData, productId);
    await manageProductTags(formData, productId);
    await createProductSpecifications(
      formData,
      productId,
      categoryData.categoryId
    );

    // Commit the transaction if everything works
    await connection.commit();

    return { message: "Product submitted successfully" };
  } catch (error) {
    // Rollback in case of any errors
    await connection.rollback();
    console.error("Error in submitProduct:", error);

    if (error instanceof z.ZodError) {
      return {
        message: "Invalid form data",
        issues: error.issues.map((issue) => issue.message),
      };
    }

    return {
      message: "An error occurred while submitting the product",
      issues: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    connection.release();
  }
}
