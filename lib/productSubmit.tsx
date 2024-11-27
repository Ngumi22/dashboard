"use server";

import { getConnection } from "./database";
import { z } from "zod";
import { NewProductSchemaServer } from "./ProductSchema";
import { dbsetupTables } from "./MysqlTables";
import {
  addBrand,
  createProductImages,
  createProductTags,
  createProductSpecifications,
} from "./product_actions";
import { NextResponse } from "next/server";
import { createSupplier } from "./actions/Supplier/post";
import { getErrorMessage } from "./utils";

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

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

type ParsedProductData = z.infer<typeof NewProductSchemaServer> & {
  category_id?: number;
  brand_id?: number;
  created_by?: number | null;
  updated_by?: number | null;
};

async function insertProduct(
  parsedData: ParsedProductData,
  formData: FormData
) {
  // Start by using parsedData.brand_id directly
  let brand_id = parsedData.brand_id;

  if (!brand_id) {
    const brandResponse = await addBrand(formData);
    const brandData = await brandResponse.json();
    parsedData.brand_id = brandData.brandId;

    console.log("Brand ID obtained from addBrand:", brand_id);
  }
  const productData = {
    product_name: formData.get("product_name"),
    product_sku: formData.get("product_sku"),
    product_description: formData.get("product_description"),
    product_status: formData.get("product_status"),
    product_price: formData.get("product_price"),
    product_quantity: formData.get("product_quantity"),
    product_discount: formData.get("product_discount"),
    category_id: formData.get("category_id"),
  };

  console.log("Category Id:", productData.category_id);
  try {
    // Validate the input data (including category_id)
    const validatedData = NewProductSchemaServer.pick({
      product_name: true,
      product_description: true,
      product_status: true,
      product_sku: true,
      product_price: true,
      product_discount: true,
      product_quantity: true,
      category_id: true,
    }).parse(productData);

    return dbOperation(async (connection) => {
      // Check if the category already exists
      const [existingProduct] = await connection.query(
        "SELECT product_id FROM products WHERE product_sku = ?",
        [validatedData.product_sku]
      );

      if (existingProduct.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Product already exists",
          productId: existingProduct[0].product_id,
        });
      }

      const [result] = await connection.query(
        `INSERT INTO products (product_name, product_sku, product_description, product_price, product_quantity, product_discount, product_status, category_id, brand_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validatedData.product_name,
          validatedData.product_sku,
          validatedData.product_description,
          validatedData.product_price,
          validatedData.product_quantity,
          validatedData.product_discount,
          validatedData.product_status,
          validatedData.category_id, // Use validatedData instead of parsedData
          parsedData.brand_id,
          parsedData.created_by || null,
          parsedData.updated_by || null,
        ]
      );

      const productId = (result as any).insertId;
      console.log("Product inserted successfully with ID:", productId);

      return productId;
    });
    // console.log("Starting product insertion...");
  } catch (error) {
    console.error("Error inserting product:", error);
    throw error;
  }
}

export async function SubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  // Convert FormData to a Record for easier manipulation
  const formData: Record<string, any> = Object.fromEntries(data);

  // Directly access `category_id`
  const categoryId = formData["category_id"];
  if (!categoryId) {
    return {
      message: "Category ID is required",
      issues: ["Category ID is missing in the form data."],
    };
  }

  // console.log("Category ID:", categoryId);

  // Process tags
  formData["tags"] = Object.keys(formData)
    .filter((key) => key.startsWith("tags["))
    .map((key) => {
      try {
        return JSON.parse(formData[key].toString());
      } catch (e) {
        console.error(`Error parsing tag for key ${key}:`, e);
        return null;
      }
    })
    .filter((tag) => tag !== null);

  // Process thumbnails
  const thumbnails = data.getAll("thumbnails") as File[];
  formData["thumbnails"] = thumbnails.length > 0 ? thumbnails : [];

  // Process suppliers
  formData["suppliers"] = Object.keys(formData)
    .filter((key) => key.startsWith("suppliers["))
    .map((key) => {
      try {
        return JSON.parse(formData[key].toString());
      } catch (e) {
        console.error(`Error parsing supplier for key ${key}:`, e);
        return null;
      }
    })
    .filter((supplier) => supplier !== null);

  // Process specifications
  formData["specifications"] = Object.keys(formData)
    .filter((key) => key.startsWith("specifications["))
    .map((key) => {
      try {
        const spec = JSON.parse(formData[key].toString());
        if (spec && spec.specification_name && spec.specification_value) {
          return spec;
        }
        console.error(`Invalid specification format for key ${key}:`, spec);
        return null;
      } catch (e) {
        console.error(`Error parsing specification for key ${key}:`, e);
        return null;
      }
    })
    .filter((spec) => spec !== null);

  // Validate data with Zod
  const parsed = NewProductSchemaServer.safeParse(formData);

  if (!parsed.success) {
    console.error("Validation errors:", parsed.error.issues);
    return {
      message: "Invalid form data",
      fields: Object.keys(formData).reduce(
        (acc, key) => ({ ...acc, [key]: formData[key].toString() }),
        {}
      ),
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  // console.log("Parsed Data:", parsed.data);

  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Ensure database tables exist
    await dbsetupTables();

    const parsedData: ParsedProductData = parsed.data;

    // Assign category ID to the parsed data
    parsedData.category_id = categoryId;

    // Add brand and retrieve the brand ID
    const brandResponse = await addBrand(data);
    const brandData = await brandResponse.json();
    parsedData.brand_id = brandData.brandId;

    // Insert product and retrieve product ID
    const productId = await insertProduct(parsedData, data);

    // Add suppliers and retrieve supplier IDs
    const supplierResponse = await createSupplier(data, productId);
    const supplierData = await supplierResponse.json();
    const supplierIds = supplierData.supplierIds;

    if (!supplierIds || supplierIds.length === 0) {
      throw new Error("No suppliers were added or mapped.");
    }

    // Map suppliers to the product
    const supplierInsertQueries = supplierIds.map((supplierId: any) =>
      connection.execute(
        `
        INSERT INTO product_suppliers (product_id, supplier_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE supplier_id = VALUES(supplier_id)
      `,
        [productId, supplierId]
      )
    );
    await Promise.all(supplierInsertQueries);

    // Handle images, tags, and specifications
    await createProductImages(data, productId);
    await createProductTags(data, productId);
    await createProductSpecifications(data, productId, categoryId);

    // Commit the transaction
    await connection.commit();

    return { message: "Product submitted successfully" };
  } catch (error) {
    // Rollback transaction in case of failure
    await connection.rollback();
    console.error("Error during submission:", error);

    return {
      message: "An error occurred while submitting the product",
      issues: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    connection.release(); // Always release the connection
  }
}
