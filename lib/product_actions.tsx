"use server";

import { FieldPacket, ResultSetHeader } from "mysql2/promise";
import { getConnection } from "./database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbsetupTables } from "./MysqlTables";
import { schema } from "./formSchema";
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
    category_name: formData.get("category_name"),
    category_description: formData.get("category_description"),
    category_image: formData.get("category_image"), // Get the image from formData
  };

  try {
    // Validate the input data (excluding image for now)
    const validatedData = NewProductSchema.pick({
      category_name: true,
      category_description: true,
    }).parse(categoryData);

    return dbOperation(async (connection) => {
      // Check if the category already exists
      const [existingCategory] = await connection.query(
        "SELECT category_id FROM categories WHERE category_name = ?",
        [validatedData.category_name]
      );

      if (existingCategory.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Category already exists",
          categoryId: existingCategory[0].category_id,
        });
      }

      // Convert the image to buffer (handle it manually)
      const categoryImageBuffer = await fileToBuffer(
        categoryData.category_image as File // Ensure correct type
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
    brand_name: formData.get("brand_name"),
    brand_image: formData.get("brand_image"),
  };

  try {
    // Validate the input data (excluding image for now)
    const validatedData = NewProductSchema.pick({
      brand_name: true,
    }).parse(brandData);

    return dbOperation(async (connection) => {
      // Check if the brand already exists
      const [existingBrand] = await connection.query(
        "SELECT brand_id FROM brands WHERE brand_name = ?",
        [validatedData.brand_name]
      );

      if (existingBrand.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Brand already exists",
          brandId: existingBrand[0].brand_id,
        });
      }

      // Convert the brand image to buffer
      const brandImageBuffer = await fileToBuffer(
        brandData.brand_image as File // Ensure correct type
      );

      // Insert the new brand into the database
      const [result] = await connection.query(
        "INSERT INTO brands (brand_name, brand_image, created_by, updated_by) VALUES (?, ?, null, null)",
        [
          validatedData.brand_name,
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
  const supplierData = {
    supplier_id: formData.get("supplier_id"),
    supplier_name: formData.get("supplier_name"),
    supplier_email: formData.get("supplier_email"),
    supplier_phone_number: formData.get("supplier_phone_number"),
    supplier_location: formData.get("supplier_location"),
  };

  try {
    // Extract only the supplier part from NewProductSchema
    const SupplierSchema = NewProductSchema.shape.suppliers.element;

    // Validate supplier data using the extracted SupplierSchema
    const validatedSupplierData = SupplierSchema.parse(supplierData);

    return dbOperation(async (connection) => {
      // Check if the supplier already exists
      const [existingSupplier] = await connection.query(
        "SELECT supplier_id FROM suppliers WHERE supplier_name = ?",
        [validatedSupplierData.supplier_name]
      );

      if (existingSupplier.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Supplier already exists",
          supplierId: existingSupplier[0].supplier_id,
        });
      }

      // Insert the new supplier into the database
      const [result] = await connection.query(
        "INSERT INTO suppliers (supplier_name, supplier_email, supplier_phone_number, supplier_location, created_by, updated_by) VALUES (?, ?, ?, ?, null, null)",
        [
          validatedSupplierData.supplier_name,
          validatedSupplierData.supplier_email,
          validatedSupplierData.supplier_phone_number,
          validatedSupplierData.supplier_location,
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

    console.error("Error in addSupplier:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the supplier",
      },
      { status: 500 }
    );
  }
}

const ProductSupplierSchema = z.object({
  productId: z.number().positive(),
  supplierId: z.number().positive(),
});

export async function createProductSupplierMapping(
  productId: number | undefined,
  supplierId: number | undefined
) {
  if (!productId || !supplierId) {
    return NextResponse.json(
      {
        success: false,
        message: "Both productId and supplierId are required",
      },
      { status: 400 }
    );
  }

  try {
    const validatedData = ProductSupplierSchema.parse({
      productId,
      supplierId,
    });

    return dbOperation(async (connection) => {
      const [rows] = await connection.query(
        `SELECT
          (SELECT COUNT(*) FROM products WHERE product_id = ?) AS productExists,
          (SELECT COUNT(*) FROM suppliers WHERE supplier_id = ?) AS supplierExists`,
        [validatedData.productId, validatedData.supplierId]
      );
      const { productExists, supplierExists } = rows[0];
      if (!productExists)
        throw new Error(
          `Product with ID ${validatedData.productId} does not exist`
        );
      if (!supplierExists)
        throw new Error(
          `Supplier with ID ${validatedData.supplierId} does not exist`
        );

      await connection.query(
        "INSERT INTO product_suppliers (product_id, supplier_id) VALUES (?, ?)",
        [validatedData.productId, validatedData.supplierId]
      );
      return NextResponse.json({
        success: true,
        message: "Product-supplier mapping created successfully",
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Validation error in createProductSupplierMapping:",
        error.issues
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: error.issues,
        },
        { status: 400 }
      );
    }
    console.error("Error in createProductSupplierMapping:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function createProductImages(
  formData: FormData,
  productId: number
) {
  const imageData = {
    mainImage: formData.get("main_image"),
    thumbnails: formData.getAll("thumbnails"),
  };

  const validatedProductId = z.number().positive().parse(productId);

  return dbOperation(async (connection) => {
    const mainImageBuffer = await fileToBuffer(imageData.mainImage as File);

    const thumbnailBuffers = await Promise.all(
      (imageData.thumbnails as File[]).map((thumbnail) =>
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

export async function createProductTags(formData: FormData, productId: number) {
  try {
    const tagsArray: Array<{ value: string }> = [];

    // Get all the keys from FormData
    const keys = Array.from(formData.keys());

    // Loop through the keys to extract tags
    keys.forEach((key) => {
      if (key.startsWith("tags[")) {
        const value = formData.get(key);
        if (value) {
          tagsArray.push(JSON.parse(value.toString()));
        }
      }
    });

    // Check if tagsArray is empty
    if (!tagsArray || tagsArray.length === 0) {
      return NextResponse.json({ success: false, message: "No tags provided" });
    }

    // Extract unique tag names
    const uniqueTags = Array.from(
      new Set(tagsArray.map((tag) => tag.value.trim()).filter((value) => value))
    );

    return dbOperation(async (connection) => {
      const tagIds: number[] = [];

      for (const tagName of uniqueTags) {
        const [tagRows] = await connection.query(
          "SELECT tag_id FROM tags WHERE tag_name = ? FOR UPDATE",
          [tagName]
        );

        let tagId: number;

        if (tagRows.length === 0) {
          const [tagResult]: [any, any] = await connection.query(
            "INSERT INTO tags (tag_name) VALUES (?)",
            [tagName]
          );
          tagId = tagResult.insertId; // Get the inserted tag ID
        } else {
          tagId = tagRows[0].tag_id;
        }
        tagIds.push(tagId);
      }

      // Insert into product_tags table
      const productTagRelations = tagIds.map((tagId) => [productId, tagId]);

      await connection.query(
        "INSERT IGNORE INTO product_tags (product_id, tag_id) VALUES ?",
        [productTagRelations]
      );

      return NextResponse.json({
        success: true,
        message: "Product tags inserted successfully",
      });
    });
  } catch (error) {
    console.error("Error in createProductTags:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding the tags",
      },
      { status: 500 }
    );
  }
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
