"use server";

import { FieldPacket, ResultSetHeader } from "mysql2/promise";
import { getConnection } from "./database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbsetupTables } from "./MysqlTables";
import {
  brandSchema,
  categorySchema,
  imageSchema,
  schema,
  supplierSchema,
} from "./formSchema";

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// TypeScript types for supplier schema
type SupplierData = {
  supplier?: {
    supplier_id?: number;
    name?: string;
    contact_info?: {
      email: string;
      phone?: string;
      address?: string;
    } | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    created_by?: number;
    updated_by?: number;
  };
  newSupplier?: {
    name: string;
    contact_info?: {
      email: string;
      phone?: string;
      address?: string;
    } | null;
    created_by?: number | null;
    updated_by?: number | null;
  };
};

// Helper function for database operations
async function dbOperation<T>(
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
    throw error;
  } finally {
    connection.release();
  }
}

// Helper function to convert File to Buffer
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper functions for parsing form data
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

export async function addCategory(formData: FormData) {
  const categoryData = {
    categoryName: formData.get("categoryName"),
    categoryDescription: formData.get("categoryDescription"),
    categoryImage: formData.get("categoryImage"),
  };

  try {
    const validatedData = categorySchema.parse(categoryData);

    return dbOperation(async (connection) => {
      const [existingCategory] = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [validatedData.categoryName]
      );
      if (existingCategory.length > 0) {
        throw new CustomError("Category already exists", 400);
      }

      const categoryImageBuffer = await fileToBuffer(
        validatedData.categoryImage
      );
      const [result] = await connection.query(
        "INSERT INTO categories (category_name, category_image, category_description, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
        [
          validatedData.categoryName,
          categoryImageBuffer,
          validatedData.categoryDescription,
          parseNumberField(formData, "created_by"),
          parseNumberField(formData, "updated_by"),
        ]
      );
      return NextResponse.json({
        success: true,
        message: "Category created successfully",
        categoryId: result.insertId,
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
    console.error("Error in addCategory:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the category",
      },
      { status: 500 }
    );
  }
}

export async function addBrand(formData: FormData) {
  const brandData = {
    brandName: formData.get("brandName"),
    brandImage: formData.get("brandImage"),
  };

  try {
    // Validate brand data
    const validatedData = brandSchema.parse(brandData);

    return dbOperation(async (connection) => {
      // Check if the brand already exists
      const [existingBrand] = await connection.query(
        "SELECT brand_id FROM brands WHERE name = ?",
        [validatedData.brandName]
      );
      if (existingBrand.length > 0) {
        throw new CustomError("Brand already exists", 400);
      }

      // Convert the brand image to a buffer
      const brandImageBuffer = await fileToBuffer(validatedData.brandImage);

      // Insert the new brand into the database
      const [result] = await connection.query(
        "INSERT INTO brands (name, brandImage, created_by, updated_by) VALUES (?, ?, ?, ?)",
        [
          validatedData.brandName,
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

export async function createSupplier(formData: FormData) {
  try {
    // Parse the raw supplier data from the form
    const rawSupplierData = formData.get("supplier");
    if (typeof rawSupplierData !== "string") {
      throw new Error("Invalid supplier data");
    }
    const supplierData = JSON.parse(rawSupplierData);
    console.log("Raw supplier data:", supplierData);

    // Validate supplier data using the supplierSchema
    const validatedData = supplierSchema.parse(supplierData);
    console.log("Validated supplier data:", validatedData);

    // Check if we're dealing with a new supplier
    if (validatedData.newSupplier) {
      const { name, contact_info, created_by, updated_by } =
        validatedData.newSupplier;

      return await dbOperation(async (connection) => {
        const [result] = await connection.execute(
          "INSERT INTO suppliers (name, contact_info, created_by, updated_by) VALUES (?, ?, ?, ?)",
          [
            name,
            JSON.stringify(contact_info || null),
            created_by || null,
            updated_by || null,
          ]
        );

        if ("insertId" in result) {
          return NextResponse.json({
            success: true,
            message: "Supplier created successfully",
            supplierId: result.insertId,
          });
        } else {
          throw new Error("Failed to insert supplier");
        }
      });
    } else if (validatedData.supplier) {
      // This case is for updating an existing supplier, which we're not handling in this function
      throw new Error(
        "Updating existing suppliers is not supported in this function"
      );
    } else {
      throw new Error("Invalid supplier data: newSupplier is required");
    }
  } catch (error) {
    console.error("Error processing supplier:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 }
    );
  }
}

export async function createProductSupplierMapping(
  productId: number,
  supplierId: number
) {
  const validatedProductId = z.number().positive().parse(productId);
  const validatedSupplierId = z.number().positive().parse(supplierId);

  return dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `SELECT
        (SELECT COUNT(*) FROM products WHERE product_id = ?) AS productExists,
        (SELECT COUNT(*) FROM suppliers WHERE supplier_id = ?) AS supplierExists`,
      [validatedProductId, validatedSupplierId]
    );
    const { productExists, supplierExists } = rows[0];
    if (!productExists)
      throw new Error(`Product with ID ${validatedProductId} does not exist`);
    if (!supplierExists)
      throw new Error(`Supplier with ID ${validatedSupplierId} does not exist`);

    await connection.query(
      "INSERT INTO product_suppliers (product_id, supplier_id) VALUES (?, ?)",
      [validatedProductId, validatedSupplierId]
    );
    return NextResponse.json({
      success: true,
      message: "Product-supplier mapping created successfully",
    });
  });
}

export async function createProductImages(
  formData: FormData,
  productId: number
) {
  const imageData = {
    mainImage: formData.get("mainImage"),
    thumbnails: formData.getAll("thumbnails"),
  };

  const validatedData = imageSchema.parse(imageData);
  const validatedProductId = z.number().positive().parse(productId);

  return dbOperation(async (connection) => {
    const mainImageBuffer = await fileToBuffer(validatedData.mainImage as File);
    const thumbnailBuffers = await Promise.all(
      (validatedData.thumbnails as File[]).map((thumbnail) =>
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

export async function manageProductTags(formData: FormData, productId: number) {
  const tagsData = parseJsonField(formData, "tags");
  const validatedData = schema.shape.tags.parse(tagsData);
  const validatedProductId = z.number().positive().parse(productId);

  return dbOperation(async (connection) => {
    if (!validatedData || validatedData.length === 0) {
      return NextResponse.json({ success: false, message: "No tags provided" });
    }

    const uniqueTags = Array.from(new Set(validatedData));
    const tagIds = await Promise.all(
      uniqueTags.map(async (tag) => {
        const [result] = await connection.query(
          "INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE tag_id = LAST_INSERT_ID(tag_id)",
          [tag]
        );
        return result.insertId;
      })
    );

    await connection.query(
      "INSERT IGNORE INTO product_tags (product_id, tag_id) VALUES ?",
      [tagIds.map((tagId) => [validatedProductId, tagId])]
    );
    return NextResponse.json({
      success: true,
      message: "Product tags managed successfully",
    });
  });
}

export async function createProductSpecifications(
  formData: FormData,
  productId: number,
  categoryId: number
) {
  const specificationData = parseJsonField(formData, "specificationData");
  const validatedData = schema.shape.specificationData.parse(specificationData);
  const validatedProductId = z.number().positive().parse(productId);
  const validatedCategoryId = z.number().positive().parse(categoryId);

  return dbOperation(async (connection) => {
    if (!validatedData || validatedData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No specifications provided",
      });
    }

    for (const spec of validatedData) {
      const [existingSpec] = await connection.query(
        "SELECT specification_id FROM specifications WHERE name = ?",
        [spec.name]
      );
      let specificationId: number;

      if (existingSpec.length > 0) {
        specificationId = existingSpec[0].specification_id;
      } else {
        const [result] = await connection.query(
          "INSERT INTO specifications (name) VALUES (?)",
          [spec.name]
        );
        specificationId = result.insertId;
        await connection.query(
          "INSERT INTO category_specifications (category_id, specification_id) VALUES (?, ?)",
          [validatedCategoryId, specificationId]
        );
      }

      await connection.query(
        "INSERT INTO product_specifications (product_id, specification_id, value) VALUES (?, ?, ?)",
        [validatedProductId, specificationId, spec.value]
      );
    }
    return NextResponse.json({
      success: true,
      message: "Product specifications created successfully",
    });
  });
}

// Create or update variant with images
// export async function createVariantWithImages(formData: FormData) {
//   return dbOperation(async (connection) => {
//     const validatedData = variantSchema.parse(Object.fromEntries(formData));

//     // Validate images
//     const imageValidationResult = validateImage(validatedData.variant_image);
//     if (!imageValidationResult.valid) {
//       throw new Error(imageValidationResult.message);
//     }

//     for (const thumbnail of validatedData.variant_thumbnails) {
//       const thumbnailValidationResult = validateImage(thumbnail);
//       if (!thumbnailValidationResult.valid) {
//         throw new Error(thumbnailValidationResult.message);
//       }
//     }

//     // Insert variant into the database
//     const [variantResult] = await connection.query(
//       `INSERT INTO variants (product_id, variant_type_id, value, price, quantity, status, created_by, updated_by)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         validatedData.product_id,
//         validatedData.variant_type_id,
//         validatedData.value,
//         validatedData.price,
//         validatedData.quantity,
//         validatedData.status,
//         validatedData.created_by,
//         validatedData.updated_by,
//       ]
//     );

//     const variantId = variantResult.insertId;
//     if (!variantId) {
//       throw new Error("Failed to create variant.");
//     }

//     // Convert images to buffers
//     const variantImageBuffer = await fileToBuffer(validatedData.variant_image);
//     const thumbnailBuffers = await Promise.all(
//       validatedData.variant_thumbnails.map(fileToBuffer)
//     );

//     // Insert images into the database
//     const [imageResult] = await connection.query(
//       `INSERT INTO product_variant_images
//         (variant_id, variant_image, variant_thumbnail1, variant_thumbnail2, variant_thumbnail3, variant_thumbnail4, variant_thumbnail5)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         variantId,
//         variantImageBuffer,
//         ...thumbnailBuffers,
//         ...Array(5 - thumbnailBuffers.length).fill(null),
//       ]
//     );

//     if (!imageResult.insertId) {
//       throw new Error("Failed to insert variant images.");
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Variant created and images uploaded successfully.",
//       variantId,
//       imageId: imageResult.insertId,
//     });
//   });
// }
