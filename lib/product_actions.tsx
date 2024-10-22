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
import { NewProductSchema } from "./ProductSchema";

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

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
    categoryName: formData.get("category_name"),
    categoryDescription: formData.get("category_Nescription"),
    categoryImage: formData.get("category_image"),
  };

  try {
    // Validate the input data
    const validatedData = NewProductSchema.parse(categoryData);

    return dbOperation(async (connection) => {
      // Check if the category already exists
      const [existingCategory] = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [validatedData.category_name]
      );

      if (existingCategory.length > 0) {
        // Instead of throwing an error, return the existing category ID
        return NextResponse.json({
          success: true,
          message: "Category already exists",
          categoryId: existingCategory[0].category_id,
        });
      }

      // Convert categoryImage to buffer
      const categoryImageBuffer = await fileToBuffer(
        validatedData.category_image
      );

      // Insert the new category into the database
      const [result] = await connection.query(
        "INSERT INTO categories (category_name, category_image, category_description, created_by, updated_by) VALUES (?, ?, ?, null, null)",
        [
          validatedData.category_name,
          categoryImageBuffer,
          validatedData.category_description,
          parseNumberField(formData, "created_by"),
          parseNumberField(formData, "updated_by"),
        ]
      );

      // Return the new category ID
      return NextResponse.json({
        success: true,
        message: "Category created successfully",
        categoryId: result.insertId,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
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
      // Handle custom errors (e.g., custom validation issues)
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    // Log and handle any other unexpected errors
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
    brandName: formData.get("brand_name"),
    brandImage: formData.get("brand_image"),
  };

  try {
    // Validate brand data
    const validatedData = NewProductSchema.parse(brandData);

    return dbOperation(async (connection) => {
      // Check if the brand already exists
      const [existingBrand] = await connection.query(
        "SELECT brand_id FROM brands WHERE brand_name = ?",
        [validatedData.brand_name]
      );

      // If the brand exists, return the existing brand_id
      if (existingBrand.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Brand already exists",
          brandId: existingBrand[0].brand_id,
        });
      }

      // Convert the brand image to a buffer
      const brandImageBuffer = await fileToBuffer(validatedData.brand_image);

      // Insert the new brand into the database
      const [result] = await connection.query(
        "INSERT INTO brands (brand_name, brandImage, created_by, updated_by) VALUES (?, ?, null, null)",
        [
          validatedData.brand_name,
          brandImageBuffer,
          parseNumberField(formData, "created_by"),
          parseNumberField(formData, "updated_by"),
        ]
      );

      // Return the newly inserted brand's ID
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

// Define a schema to validate supplier data
const SupplierSchema = z.object({
  supplierId: z.string().optional(),
  supplierName: z.string(),
  supplierEmail: z.string().email(),
  supplierPhoneNumber: z.string(),
  supplierLocation: z.string(),
});

export async function createSupplier(formData: FormData) {
  // Extract supplier data from formData
  const supplierData = {
    supplierId: formData.get("suppliers.supplier_id"),
    supplierName: formData.get("suppliers.supplier_name"),
    supplierEmail: formData.get("suppliers.supplier_email"),
    supplierPhoneNumber: formData.get("suppliers.supplier_phone_number"),
    supplierLocation: formData.get("suppliers.supplier_location"),
  };

  try {
    // Validate supplier data against the schema
    const validatedSupplierData = SupplierSchema.parse(supplierData);

    return dbOperation(async (connection) => {
      // Check if the supplier already exists in the database
      const [existingSupplier] = await connection.query(
        "SELECT supplier_id FROM suppliers WHERE supplier_name = ? OR supplier_email = ?",
        [
          validatedSupplierData.supplierName,
          validatedSupplierData.supplierEmail,
        ]
      );

      // If the supplier exists, return the existing supplier ID
      if (existingSupplier.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Supplier already exists",
          supplierId: existingSupplier[0].supplier_id,
        });
      }

      // Insert new supplier into the database
      const [result] = await connection.query(
        `INSERT INTO suppliers
          (supplier_name, supplier_email, supplier_phone_number, supplier_location, created_by, updated_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
        [
          validatedSupplierData.supplierName,
          validatedSupplierData.supplierEmail,
          validatedSupplierData.supplierPhoneNumber,
          validatedSupplierData.supplierLocation,
          parseNumberField(formData, "created_by"),
          parseNumberField(formData, "updated_by"),
        ]
      );

      // Return the newly inserted supplier's ID
      return NextResponse.json({
        success: true,
        message: "Supplier created successfully",
        supplierId: result.insertId,
      });
    });
  } catch (error) {
    // Handle validation errors
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

    // Handle custom or other unexpected errors
    console.error("Error in createSupplier:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the supplier",
      },
      { status: 500 }
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
          "INSERT INTO tags (tag_name) VALUES (?) ON DUPLICATE KEY UPDATE tag_id = LAST_INSERT_ID(tag_id)",
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
