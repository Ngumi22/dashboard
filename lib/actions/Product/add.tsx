"use server";

import { NewProductSchemaServer } from "@/lib/ZodSchemas/productSchema";
import { ParsedProductData } from "./productTypes";
import { addBrand } from "../Brand/post";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { createSupplier } from "../Supplier/post";
import { createProductImages } from "../Images/post";
import { createProductTags } from "../Tags/post";
import { createProductSpecifications } from "../Specifications/post";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/Auth_actions/auth-actions";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

/**
 * Inserts a new product into the database.
 */

export async function onSubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Unauthorized: Please log in first.", issues: [] };
  }

  if (user.role !== "admin") {
    return { message: "Forbidden: Only admins can add products.", issues: [] };
  }

  return dbOperation(async (connection) => {
    await connection.beginTransaction();

    try {
      // Parse and validate form data
      const formData: Record<string, any> = Object.fromEntries(data.entries());
      formData.product_id = parseInt(data.get("product_id") as string);
      formData.product_price = parseFloat(data.get("product_price") as string);
      formData.product_discount = parseFloat(
        data.get("product_discount") as string
      );
      formData.product_quantity = parseInt(
        data.get("product_quantity") as string
      );

      // Validate category_id
      const categoryId = parseInt(data.get("category_id") as string);
      if (!categoryId) {
        await connection.rollback();
        return {
          message: "Category ID is required",
          issues: ["Category ID is missing in the form data."],
        };
      }

      // Parse tags, thumbnails, suppliers, and specifications
      formData.tags = parseJSONField(data, "tags");
      formData.thumbnails = parseFileField(data, "thumbnails");
      formData.suppliers = parseSuppliers(data);
      formData.specifications = parseSpecifications(data);

      // Validate the parsed data
      const parsed = NewProductSchemaServer.safeParse(formData);
      if (!parsed.success) {
        await connection.rollback();
        return {
          message: "Invalid form data",
          fields: Object.keys(formData).reduce(
            (acc, key) => ({ ...acc, [key]: formData[key].toString() }),
            {}
          ),
          issues: parsed.error.issues.map((issue) => issue.message),
        };
      }

      // Add brand and retrieve brand ID
      const brandData = await addBrand(data, connection);
      if (!brandData.brandId) {
        await connection.rollback();
        throw new Error("Failed to add brand.");
      }

      // Prepare product data
      const parsedData: ParsedProductData = {
        ...parsed.data,
        category_id: categoryId,
        brand_id: brandData.brandId,
      };

      // Check for duplicate SKU
      const [existingProduct] = await connection.query(
        "SELECT product_id FROM products WHERE product_sku = ?",
        [parsedData.product_sku]
      );

      if (existingProduct.length > 0) {
        await connection.rollback();
        throw new Error("A product with the same SKU already exists.");
      }

      // Insert product
      const [productResult] = await connection.query(
        `INSERT INTO products (
          product_name, product_sku, product_description, product_price,
          product_quantity, product_discount, product_status, category_id, brand_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

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

      const productId = (productResult as any).insertId;

      // Add suppliers
      const supplierResponse = await createSupplier(data, productId);
      const supplierIds = supplierResponse.supplierIds;
      if (!supplierIds || supplierIds.length === 0) {
        await connection.rollback();
        throw new Error("No suppliers were added or mapped.");
      }

      // Map suppliers to the product
      const supplierInsertPromises = supplierIds.map((supplierId: number) =>
        connection.execute(
          `INSERT INTO product_suppliers (product_id, supplier_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE supplier_id = VALUES(supplier_id)`,
          [productId, supplierId]
        )
      );
      await Promise.all(supplierInsertPromises);

      // Add related product data
      await Promise.all([
        createProductImages(data, productId),
        createProductTags(data, productId),
        createProductSpecifications(data, productId, categoryId),
      ]);

      // Commit transaction
      await connection.commit();

      revalidatePath("/dashboard/products");
      return { message: "Product submitted successfully" };
    } catch (error) {
      await connection.rollback();
      console.error("Transaction Error:", error);
      return {
        message: error instanceof Error ? error.message : "Transaction failed",
        issues: [
          error instanceof Error ? error.message : "An unknown error occurred",
        ],
      };
    }
  });
}

/**
 * Helper function to parse JSON fields from form data.
 */
function parseJSONField(data: FormData, fieldName: string) {
  const rawValue = data.get(fieldName);
  try {
    return rawValue ? JSON.parse(rawValue.toString()) : [];
  } catch (e) {
    console.error(`Error parsing ${fieldName}:`, e);
    return [];
  }
}

/**
 * Helper function to parse file fields from form data.
 */
function parseFileField(data: FormData, fieldName: string) {
  const files = data.getAll(fieldName);
  return Array.isArray(files) ? files : [files];
}

/**
 * Helper function to parse suppliers from form data.
 */
function parseSuppliers(data: FormData) {
  return Array.from(data.entries())
    .filter(([key]) => key.startsWith("suppliers["))
    .map(([_, value]) => {
      try {
        return JSON.parse(value.toString());
      } catch (e) {
        console.error("Error parsing supplier:", e);
        return null;
      }
    })
    .filter((supplier) => supplier !== null);
}

/**
 * Helper function to parse specifications from form data.
 */
function parseSpecifications(data: FormData) {
  return Array.from(data.entries())
    .filter(([key]) => key.startsWith("specifications["))
    .map(([_, value]) => {
      try {
        const spec = JSON.parse(value.toString());
        if (spec?.specification_name && spec?.specification_value) {
          return spec;
        }
        console.error("Invalid specification format:", spec);
        return null;
      } catch (e) {
        console.error("Error parsing specification:", e);
        return null;
      }
    })
    .filter((spec) => spec !== null);
}
