"use server";

import { getConnection } from "./database";
import { z } from "zod";
import { NewProductSchemaServer } from "./ProductSchema";
import { dbsetupTables } from "./MysqlTables";
import {
  addCategory,
  addBrand,
  createSupplier,
  createProductImages,
  createProductTags,
  createProductSpecifications,
  dbOperation,
} from "./product_actions";
import { NextResponse } from "next/server";

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
    brand_id: formData.get("brand_id"),
  };

  console.log(productData.category_id);
  try {
    // Validate the input data (excluding image for now)
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
          parsedData.product_name,
          parsedData.product_sku,
          parsedData.product_description,
          parsedData.product_price,
          parsedData.product_quantity,
          parsedData.product_discount,
          parsedData.product_status,
          parsedData.category_id,
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
  const formData: Record<string, any> = Object.fromEntries(data);

  // Extract and add the tags
  const tags = Object.keys(formData)
    .filter((key) => key.startsWith("tags["))
    .map((key) => JSON.parse(formData[key].toString())); // Parse each tag as an object

  formData["tags"] = tags; // Assign the extracted tags array to formData

  // Ensure thumbnails are appended correctly as an array of files
  const thumbnails = data.getAll("thumbnails") as File[];
  formData["thumbnails"] = thumbnails.length > 0 ? thumbnails : [];

  // Extract suppliers as an array of objects
  const suppliers = Object.keys(formData)
    .filter((key) => key.startsWith("suppliers["))
    .map((key) => JSON.parse(formData[key].toString()));

  formData["suppliers"] = suppliers.length > 0 ? suppliers : [];

  // Extract specifications as an array of objects
  const specifications = Object.keys(formData)
    .filter((key) => key.startsWith("specifications["))
    .map((key) => JSON.parse(formData[key].toString()));

  formData["specifications"] = specifications.length > 0 ? specifications : [];

  // Zod validation and processing
  const parsed = NewProductSchemaServer.safeParse(formData);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Start transaction: Ensure necessary tables are set up
    await dbsetupTables();

    const parsedData: ParsedProductData = parsed.data;

    // Perform all insertions
    const categoryResponse = await addCategory(data);
    const categoryData = await categoryResponse.json();
    parsedData.category_id = categoryData.categoryId;

    const brandResponse = await addBrand(data);
    const brandData = await brandResponse.json();
    parsedData.brand_id = brandData.brandId;

    const productId = await insertProduct(parsedData, data);

    const supplierResponse = await createSupplier(data, productId);
    const supplierData = await supplierResponse.json();

    // console.log(supplierData); // Debug supplier data
    const supplierIds = supplierData.supplierIds;

    if (!supplierIds || supplierIds.length === 0) {
      throw new Error("No suppliers were added or mapped.");
    }

    // Insert mappings for all suppliers

    for (const supplierId of supplierIds) {
      const query = `
    INSERT INTO product_suppliers (product_id, supplier_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE supplier_id = VALUES(supplier_id)`;
      await connection.execute(query, [productId, supplierId]);
    }

    await createProductImages(data, productId);
    await createProductTags(data, productId);
    await createProductSpecifications(data, productId, categoryData.categoryId);

    // Commit the transaction if everything works
    await connection.commit();

    return { message: "Product submitted successfully" };
  } catch (error) {
    // Rollback in case of any errors
    await connection.rollback();
    console.error("Error in SubmitAction:", error);

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
