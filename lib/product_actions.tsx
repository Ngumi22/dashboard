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

export async function createSupplier(formData: FormData, productId: number) {
  try {
    const suppliersArray: Array<{
      supplier_name: string;
      supplier_email: string;
      supplier_phone_number: string;
      supplier_location: string;
    }> = [];

    // Get all the keys from FormData
    const keys = Array.from(formData.keys());

    // Loop through the keys to extract suppliers
    keys.forEach((key) => {
      if (key.startsWith("suppliers[")) {
        const value = formData.get(key);
        if (value) {
          // Parse supplier fields (assumes data is JSON serialized in each field)
          const supplier = JSON.parse(value.toString());
          suppliersArray.push(supplier);
        }
      }
    });

    console.log("Suppliers Array:", suppliersArray);

    // Check if suppliersArray is empty
    if (!suppliersArray || suppliersArray.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No suppliers provided",
      });
    }

    // Process each supplier in suppliersArray
    return dbOperation(async (connection) => {
      let supplierId: number;

      for (const supplierData of suppliersArray) {
        const {
          supplier_name,
          supplier_email,
          supplier_phone_number,
          supplier_location,
        } = supplierData;

        // Check if supplier exists
        const [existingSupplier] = await connection.query(
          "SELECT supplier_id FROM suppliers WHERE supplier_name = ? FOR UPDATE",
          [supplier_name]
        );

        if (existingSupplier.length > 0) {
          supplierId = existingSupplier[0].supplier_id;
          console.log(
            `Found existing supplier: ${supplier_name} with ID: ${supplierId}`
          );
        } else {
          // Insert new supplier
          const [result]: [any, any] = await connection.query(
            "INSERT INTO suppliers (supplier_name, supplier_email, supplier_phone_number, supplier_location, created_by, updated_by) VALUES (?, ?, ?, ?, null, null)",
            [
              supplier_name,
              supplier_email,
              supplier_phone_number,
              supplier_location,
            ]
          );
          supplierId = result.insertId; // Get the inserted supplier ID
          console.log(
            `Inserted new supplier: ${supplier_name} with ID: ${supplierId}`
          );
        }

        // Insert into product_supplier table for mapping
        await connection.query(
          "INSERT IGNORE INTO product_suppliers (product_id, supplier_id) VALUES (?, ?)",
          [productId, supplierId]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Suppliers inserted and mapped to product successfully",
      });
    });
  } catch (error) {
    console.error("Error in createSupplier:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding suppliers",
      },
      { status: 500 }
    );
  }
}

// Define validation schema for input
const ProductSupplierSchema = z.object({
  productId: z.number().positive(),
  supplierId: z.number().positive(),
});

export async function createProductSupplierMapping(
  productId: number,
  supplierId: number
) {
  try {
    // Validate productId and supplierId
    const validatedData = ProductSupplierSchema.parse({
      productId,
      supplierId,
    });

    return dbOperation(async (connection) => {
      // Check if the mapping already exists
      const [existingMapping] = await connection.query(
        "SELECT 1 FROM product_suppliers WHERE product_id = ? AND supplier_id = ?",
        [validatedData.productId, validatedData.supplierId]
      );

      if (existingMapping.length > 0) {
        // If mapping exists, respond without creating a new row
        return NextResponse.json({
          success: true,
          message: "Product-supplier mapping already exists",
        });
      }

      // Insert new mapping if it doesn't exist
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

// Define validation schema for input
const ProductSpecificationSchema = z.object({
  productId: z.number().positive(),
  categoryId: z.number().positive(), // New field to check against category specifications
  specifications: z.array(
    z.object({
      specification_name: z.string().min(1), // Ensure specification name is not empty
      specification_value: z.string().min(1), // Ensure specification value is not empty
    })
  ),
});

export async function createProductSpecifications(
  formData: FormData,
  productId: number,
  categoryId: number
) {
  try {
    const specificationsArray: Array<{
      specification_name: string;
      specification_value: string;
    }> = [];

    // Get all keys from FormData
    const keys = Array.from(formData.keys());

    // Loop through keys to extract specifications
    keys.forEach((key) => {
      if (key.startsWith("specifications[")) {
        const value = formData.get(key);
        if (value) {
          specificationsArray.push(JSON.parse(value.toString()));
        }
      }
    });

    console.log("Specifications Array:", specificationsArray);

    // Check if specificationsArray is empty
    if (!specificationsArray || specificationsArray.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No specifications provided",
      });
    }

    return dbOperation(async (connection) => {
      const specificationIds: number[] = [];

      for (const spec of specificationsArray) {
        const { specification_name, specification_value } = spec;

        // Step 1: Insert new specification if it doesn't exist
        const [specRows] = await connection.query(
          "SELECT specification_id FROM specifications WHERE specification_name = ? FOR UPDATE",
          [specification_name]
        );

        let specificationId: number;

        if (specRows.length === 0) {
          try {
            // Insert new specification if it doesn't exist
            const [result] = await connection.query(
              "INSERT INTO specifications (specification_name) VALUES (?)",
              [specification_name]
            );
            specificationId = result.insertId; // Get the inserted specification ID
            console.log(
              `Inserted new specification: ${specification_name} with ID: ${specificationId}`
            );

            // Step 2: Insert into category_specifications if it doesn't exist
            const [categorySpecRows] = await connection.query(
              "SELECT category_spec_id FROM category_specifications WHERE category_id = ? AND specification_id = ?",
              [categoryId, specificationId]
            );

            if (categorySpecRows.length === 0) {
              await connection.query(
                "INSERT INTO category_specifications (category_id, specification_id) VALUES (?, ?)",
                [categoryId, specificationId]
              );
              console.log(
                `Inserted new category-specification mapping for category ID ${categoryId} and specification ID ${specificationId}`
              );
            }
          } catch (insertError: any) {
            console.error(
              `Error inserting specification "${specification_name}":`,
              insertError
            );
            return NextResponse.json({
              success: false,
              message: `Error inserting specification "${specification_name}": ${insertError.message}`,
            });
          }
        } else {
          specificationId = specRows[0].specification_id;
          console.log(
            `Found existing specification: ${specification_name} with ID: ${specificationId}`
          );
        }

        // Check if the specification is valid for the category
        const [categorySpecRows] = await connection.query(
          "SELECT 1 FROM category_specifications WHERE category_id = ? AND specification_id = ?",
          [categoryId, specificationId]
        );

        if (categorySpecRows.length === 0) {
          console.log(
            `Specification "${specification_name}" is not valid for category ID ${categoryId}.`
          );
          continue; // Skip this specification if it's not valid for the category
        }

        // Step 3: Insert into product_specifications table
        await connection.query(
          "INSERT INTO product_specifications (product_id, specification_id, value) VALUES (?, ?, ?)",
          [productId, specificationId, specification_value]
        );

        specificationIds.push(specificationId); // Collect specification IDs if needed
      }

      return NextResponse.json({
        success: true,
        message: "Specifications inserted and mapped to product successfully",
      });
    });
  } catch (error) {
    console.error("Error in createProductSpecifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while adding specifications",
      },
      { status: 500 }
    );
  }
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
