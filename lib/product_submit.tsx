"use server";

import { getConnection } from "./database";
import { z } from "zod";
import { schema } from "./formSchema";

// Import all your individual insertion functions
import {
  addCategory,
  addBrand,
  createSupplier,
  createProductImages,
  manageProductTags,
  createProductSpecifications,
  createProductSupplierMapping,
} from "./product_actions";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

function parseJsonField(formData: Record<string, any>, key: string): any {
  if (formData[key]) {
    try {
      return JSON.parse(formData[key]);
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      throw new Error(`Failed to parse ${key} data.`);
    }
  }
  return undefined;
}

function parseNumberField(
  formData: Record<string, any>,
  key: string
): number | undefined {
  if (formData[key]) {
    const value = Number(formData[key]);
    if (isNaN(value)) {
      throw new Error(`Invalid ${key} data: not a number.`);
    }
    return value;
  }
  return undefined;
}

// Main function to coordinate all insertions
// New function to insert product data
async function insertProduct(formData: Record<string, any>) {
  const connection = await getConnection();
  try {
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

    return (result as any).insertId;
  } catch (error) {
    throw error;
  }
}

// Main function to coordinate all insertions
export async function submitProduct(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const connection = await getConnection();
  await connection.beginTransaction();

  const formData: Record<string, any> = Object.fromEntries(data);

  try {
    // Parse JSON fields
    [
      "images",
      "specificationData",
      "supplier",
      "tags",
      "brand",
      "category",
    ].forEach((field) => {
      formData[field] = parseJsonField(formData, field);
    });

    // Parse number fields
    ["price", "quantity", "discount"].forEach((field) => {
      formData[field] = parseNumberField(formData, field);
    });

    // Validate the form data using Zod
    schema.parse(formData);

    // Perform all insertions
    const categoryResponse = await addCategory(data);
    const categoryData = await categoryResponse.json();
    formData.category_id = categoryData.categoryId;

    const brandResponse = await addBrand(data);
    const brandData = await brandResponse.json();
    formData.brand_id = brandData.brandId;

    const supplierResponse = await createSupplier(data);
    const supplierData = await supplierResponse.json();

    const productId = await insertProduct(formData);

    await createProductSupplierMapping(productId, supplierData.supplierId);
    await createProductImages(data, productId);
    await manageProductTags(data, productId);
    await createProductSpecifications(data, productId, categoryData.categoryId);

    // If all operations are successful, commit the transaction
    await connection.commit();

    return { message: "Product submitted successfully" };
  } catch (error) {
    // If any operation fails, rollback the transaction
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
