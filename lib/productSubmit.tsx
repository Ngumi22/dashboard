"use server";

import { getConnection } from "./database";
import { z } from "zod";
import { NewProductSchema } from "./ProductSchema";
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

type ParsedProductData = z.infer<typeof NewProductSchema> & {
  category_id?: number;
  brand_id?: number;
};

async function insertProduct(parsedData: ParsedProductData) {
  const connection = await getConnection();
  try {
    console.log("Starting product insertion...");
    const [result] = await connection.query(
      `INSERT INTO products (name, sku, description, price, quantity, discount, status, category_id, brand_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, NULL), COALESCE(?, NULL), ?, ?)`,
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
      ]
    );
    console.log("Product inserted successfully.");
    return (result as any).insertId;
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
    .filter((key) => key.startsWith("tags.") && key.endsWith(".value"))
    .map((key) => ({ value: formData[key].toString() }));

  formData["tags"] = tags;

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
  const parsed = NewProductSchema.safeParse(formData);

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
    console.log("Starting transaction...");
    await dbsetupTables();
    console.log("Tables checked/created.");

    const parsedData: ParsedProductData = parsed.data;

    console.log(parsedData);

    // Perform all insertions
    const categoryResponse = await addCategory(data);
    const categoryData = await categoryResponse.json();
    parsedData.category_id = categoryData.categoryId;

    const brandResponse = await addBrand(data);
    const brandData = await brandResponse.json();
    parsedData.brand_id = brandData.brandId;

    const supplierResponse = await createSupplier(data);
    const supplierData = await supplierResponse.json();

    const productId = await insertProduct(parsedData);

    await createProductImages(data, productId);
    await manageProductTags(data, productId);
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
