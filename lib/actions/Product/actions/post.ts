"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/Auth_actions/auth-actions";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { addBrand } from "../../Brand/post";
import { createProductImages } from "../../Images/post";
import { createProductSpecifications } from "../../Specifications/post";
import { createSupplier } from "../../Supplier/post";
import { createProductTags } from "../../Tags/post";
import { NewProductSchemaServer } from "./schema";

export type FormState = {
  message: string;
  success?: boolean;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function onSubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const start = performance.now();
  const formEntries = Object.fromEntries(data.entries());

  const user = await getCurrentUser();
  if (!user) return { message: "Please login to continue." };
  if (user.role !== "admin")
    return { message: "Only admins can add products." };

  const categoryId = parseInt(data.get("category_id") as string);
  if (!categoryId)
    return {
      message: "Missing category ID",
      issues: ["category_id is required"],
    };

  // Pre-parse non-blocking fields
  const main_image = parseFileField(data, "main_image");
  const thumbnails = parseFileField(data, "thumbnails");
  const tags = parseJSONField(data, "tags");
  const suppliers = parseSuppliers(data);
  const specifications = parseSpecifications(data);

  const parsed = NewProductSchemaServer.safeParse({
    ...formEntries,
    tags,
    main_image,
    thumbnails,
    suppliers,
    specifications,
    category_id: String(categoryId),
  });
  if (!parsed.success) {
    console.error("🛑 Validation failed:", parsed.error.flatten());
    return {
      message: "Validation failed",
      fields: Object.fromEntries(
        Object.entries(formEntries).filter(
          ([_, value]) => typeof value === "string"
        ) as [string, string][]
      ),
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      ),
    };
  }

  const parsedData = parsed.data;

  try {
    return await dbOperation(async (connection) => {
      // ⏱ Step 1: Add or get brand
      const brandResult = await addBrand(data, connection);
      if (!brandResult.brandId) throw new Error("Brand creation failed");
      parsedData.brand_id = brandResult.brandId;

      // ⏱ Step 2: Ensure unique SKU
      const [skuCheck] = await connection.execute(
        `SELECT 1 FROM products WHERE product_sku = ? LIMIT 1`,
        [parsedData.product_sku]
      );
      if ((skuCheck as any[]).length > 0) {
        return {
          message: "Product SKU already exists",
          issues: ["Duplicate SKU"],
        };
      }

      // ⏱ Step 3: Insert product
      const [insertResult] = await connection.execute(
        `INSERT INTO products (product_name, product_sku, product_description, long_description, product_price, product_discount, product_quantity, product_status, brand_id, category_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parsedData.product_name,
          parsedData.product_sku,
          parsedData.product_description,
          parsedData.long_description,
          parsedData.product_price,
          parsedData.product_discount,
          parsedData.product_quantity,
          parsedData.product_status,
          parsedData.brand_id,
          parsedData.category_id,
        ]
      );

      const productId = (insertResult as any).insertId;
      await connection.commit(); // 🎯 COMMIT EARLY

      // 🔁 Post-commit async work (non-blocking)
      void Promise.all([
        createProductImages(data, productId),
        createProductTags(data, productId),
        createProductSpecifications(data, productId, categoryId),
        createSupplier(data, productId),
      ]);

      revalidatePath("/dashboard/products");

      console.log(`✅ Product added successfully in ${Date.now() - start}ms`);
      return { success: true, message: "Product added successfully" };
    });
  } catch (error) {
    console.error("🔥 onSubmitAction failed", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      message: "Something went wrong. Please try again.",
      issues: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

function parseJSONField(data: FormData, fieldName: string) {
  try {
    const rawValue = data.get(fieldName);
    return rawValue ? JSON.parse(rawValue.toString()) : [];
  } catch (e) {
    console.error(`[PARSE ERROR] ${fieldName}:`, e);
    return [];
  }
}

function parseFileField(data: FormData, fieldName: string) {
  const files = data.getAll(fieldName);
  return Array.isArray(files) ? files : [files];
}

function parseSuppliers(data: FormData) {
  return Array.from(data.entries())
    .filter(([key]) => key.startsWith("suppliers["))
    .map(([_, value]) => {
      try {
        return JSON.parse(value.toString());
      } catch (e) {
        console.error("[PARSE SUPPLIER ERROR]", e);
        return null;
      }
    })
    .filter((supplier) => supplier !== null);
}

function parseSpecifications(data: FormData) {
  return Array.from(data.entries())
    .filter(([key]) => key.startsWith("specifications["))
    .map(([_, value]) => {
      try {
        const spec = JSON.parse(value.toString());
        if (spec?.specification_name && spec?.specification_value) {
          return spec;
        }
        console.error("[INVALID SPEC FORMAT]", spec);
        return null;
      } catch (e) {
        console.error("[PARSE SPEC ERROR]", e);
        return null;
      }
    })
    .filter((spec) => spec !== null);
}
