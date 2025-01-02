"use server";

import { NewProductSchemaServer } from "@/lib/ZodSchemas/productSchema";
import { ParsedProductData } from "./productTypes";
import { addBrand } from "../Brand/post";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { dbsetupTables } from "@/lib/MysqlTables";
import { createSupplier } from "../Supplier/post";
import { createProductImages } from "../Images/post";
import { createProductTags } from "../Tags/post";
import { createProductSpecifications } from "../Specifications/post";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

async function createProduct(parsedData: ParsedProductData, data: FormData) {
  // Start by using parsedData.brand_id directly
  let brand_id = parsedData.brand_id;

  if (!brand_id) {
    const brandData = await addBrand(data);
    parsedData.brand_id = brandData.brandId;
    console.log("Brand ID obtained from addBrand:", brand_id);
  }

  const productData = {
    product_name: data.get("product_name") as string,
    product_sku: data.get("product_sku") as string,
    product_description: data.get("product_description") as string,
    product_status: data.get("product_status"),
    product_price: parseInt(data.get("product_price") as string),
    product_discount: parseInt(data.get("product_discount") as string),
    product_quantity: parseInt(data.get("product_quantity") as string),
    category_id: data.get("category_id") as string,
  };

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
        return {
          success: true,
          message: "Product already exists",
          productId: existingProduct[0].product_id,
        };
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

export async function onSubmitAction(prevState: FormState, data: FormData) {
  const formData: Record<string, any> = Object.fromEntries(data.entries());

  const productData = {
    product_id: parseInt(data.get("product_id") as string),
    product_price: parseInt(data.get("product_price") as string),
    product_discount: parseInt(data.get("product_discount") as string),
    product_quantity: parseInt(data.get("product_quantity") as string),
    product_name: data.get("product_name") as string,
    product_sku: data.get("product_sku") as string,
    product_description: data.get("product_description") as string,
    product_status: data.get("product_status"),
    brand_id: data.get("brand_id") as string,
    brand_name: data.get("brand_name") as string,
    brand_image: data.get("brand_image") as File,
    main_image: data.get("main_image") as File,
  };

  // Directly access `category_id`
  const categoryId = parseInt(data.get("category_id") as string);
  if (!categoryId) {
    return {
      message: "Category ID is required",
      issues: ["Category ID is missing in the form data."],
    };
  }

  formData["tags"] = (() => {
    const rawTags = data.get("tags");
    try {
      return rawTags ? JSON.parse(rawTags.toString()) : [];
    } catch (e) {
      console.error("Error parsing tags:", e);
      return [];
    }
  })();

  formData["thumbnails"] = Array.isArray(data.getAll("thumbnails"))
    ? data.getAll("thumbnails")
    : [data.get("thumbnails")];

  formData["suppliers"] = Array.from(data.entries())
    .filter(([key]) => key.startsWith("suppliers["))
    .map(([_, value]) => {
      try {
        return JSON.parse(value.toString());
      } catch (e) {
        console.error(`Error parsing supplier:`, e);
        return null;
      }
    })
    .filter((supplier) => supplier !== null);

  formData["specifications"] = Array.from(data.entries())
    .filter(([key]) => key.startsWith("specifications["))
    .map(([_, value]) => {
      try {
        const spec = JSON.parse(value.toString());
        if (spec && spec.specification_name && spec.specification_value) {
          return spec;
        }
        console.error(`Invalid specification format:`, spec);
        return null;
      } catch (e) {
        console.error(`Error parsing specification:`, e);
        return null;
      }
    })
    .filter((spec) => spec !== null);
  const parsed = NewProductSchemaServer.safeParse({
    ...formData,
    ...productData,
  });

  // console.log(parsed);

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

  return dbOperation(async (connection) => {
    await dbsetupTables();

    const parsedData: ParsedProductData = parsed.data;

    // Assign category ID to the parsed data
    parsedData.category_id = categoryId;

    // Add brand and retrieve the brand ID
    const brandData = await addBrand(data);
    parsedData.brand_id = brandData.brandId;

    // Insert product and retrieve product ID
    const productId = await createProduct(parsedData, data);

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

    return { message: "Product submitted successfully" };
  });
}
