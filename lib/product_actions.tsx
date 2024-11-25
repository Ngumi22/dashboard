"use server";
import { getConnection } from "./database";
import { NextResponse } from "next/server";
import { z, ZodInvalidTypeIssue } from "zod";
import { dbsetupTables } from "./MysqlTables";
import { NewProductSchema } from "./ProductSchema";
import { CategorySchema } from "./ZodSchemas/categorySchema";
import {
  FieldPacket,
  OkPacket,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const SupplierSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required."),
  supplier_email: z.string().email("Invalid email address."),
  supplier_phone_number: z.string().optional(),
  supplier_location: z.string().optional(),
});

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
    status: formData.get("status"),
  };

  try {
    // Validate the input data (excluding image for now)
    const validatedData = CategorySchema.pick({
      category_name: true,
      category_description: true,
      status: true,
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
        "INSERT INTO categories (category_name, category_image, category_description, status, created_by, updated_by) VALUES (?, ?, ?, ?, null, null)",
        [
          validatedData.category_name,
          categoryImageBuffer,
          validatedData.category_description,
          validatedData.status,
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
    // Step 1: Parse and validate suppliers
    const suppliersArray: Array<z.infer<typeof SupplierSchema>> = [];
    const keys = Array.from(formData.keys());
    for (const key of keys) {
      if (key.startsWith("suppliers[")) {
        const value = formData.get(key);
        if (value) {
          try {
            const parsedSupplier = SupplierSchema.parse(
              JSON.parse(value.toString())
            );
            suppliersArray.push(parsedSupplier);
          } catch (error) {
            console.error(`Invalid supplier data for key: ${key}`, error);
            throw new Error(
              `Invalid supplier data for key: ${key}. Ensure the JSON is correct and meets validation rules.`
            );
          }
        }
      }
    }

    if (suppliersArray.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid suppliers provided.",
        supplierIds: [],
      });
    }

    // Step 2: Perform database operations
    return dbOperation(async (connection) => {
      const supplierIds = new Set<number>(); // Use a set to avoid duplicates
      const newSuppliers: Array<z.infer<typeof SupplierSchema>> = [];
      const existingSupplierMap = new Map<string, number>(); // Map supplier_name -> supplier_id

      await connection.beginTransaction();

      try {
        // Step 3: Fetch existing suppliers in bulk
        const supplierNames = suppliersArray.map((s) => s.supplier_name);
        const [existingSuppliers] = await connection.query(
          `SELECT supplier_id, supplier_name FROM suppliers WHERE supplier_name IN (?) FOR UPDATE`,
          [supplierNames]
        );

        for (const existingSupplier of existingSuppliers as {
          supplier_id: number;
          supplier_name: string;
        }[]) {
          existingSupplierMap.set(
            existingSupplier.supplier_name,
            existingSupplier.supplier_id
          );
        }

        // Step 4: Identify and prepare new suppliers
        for (const supplier of suppliersArray) {
          if (!existingSupplierMap.has(supplier.supplier_name)) {
            newSuppliers.push(supplier);
          }
        }

        // Step 5: Insert new suppliers in bulk if necessary
        if (newSuppliers.length > 0) {
          const insertValues = newSuppliers.map((supplier) => [
            supplier.supplier_name,
            supplier.supplier_email || null,
            supplier.supplier_phone_number || null,
            supplier.supplier_location || null,
            null, // created_by defaults to NULL
            null, // updated_by defaults to NULL
          ]);

          const [insertResult] = await connection.query(
            `INSERT INTO suppliers (
              supplier_name,
              supplier_email,
              supplier_phone_number,
              supplier_location,
              created_by,
              updated_by
            ) VALUES ?`,
            [insertValues]
          );

          // Map newly inserted suppliers to IDs
          const startId = (insertResult as { insertId: number }).insertId;
          newSuppliers.forEach((supplier, index) => {
            const supplierId = startId + index;
            existingSupplierMap.set(supplier.supplier_name, supplierId);
          });
        }

        // Step 6: Map suppliers to the product
        const mappingValues = Array.from(existingSupplierMap.values()).map(
          (supplierId) => [productId, supplierId]
        );

        await connection.query(
          `INSERT IGNORE INTO product_suppliers (product_id, supplier_id) VALUES ?`,
          [mappingValues]
        );

        // Step 7: Collect all supplier IDs
        existingSupplierMap.forEach((id) => supplierIds.add(id));

        // Commit transaction
        await connection.commit();

        return NextResponse.json({
          success: true,
          message: "Suppliers added and mapped to the product successfully.",
          supplierIds: Array.from(supplierIds),
        });
      } catch (error) {
        await connection.rollback();
        console.error("Error during supplier creation:", error);
        throw error;
      }
    });
  } catch (error) {
    console.error("Error in createSupplier:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while adding suppliers.",
        supplierIds: [],
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
  data: FormData,
  productId: number,
  categoryId: number
) {
  if (!categoryId) {
    throw new Error("Category ID is required to add specifications.");
  }

  if (!productId) {
    throw new Error("Product ID is required to associate specifications.");
  }

  const specifications = Object.keys(Object.fromEntries(data.entries()))
    .filter((key) => key.startsWith("specifications["))
    .map((key) => {
      const specData = data.get(key)?.toString();
      try {
        const parsed = JSON.parse(specData || "{}");

        if (
          parsed &&
          parsed.specification_name &&
          parsed.specification_value &&
          parsed.category_id
        ) {
          parsed.category_id = Number(parsed.category_id);
          return parsed;
        } else {
          console.warn(`Invalid specification:`, parsed);
          return null;
        }
      } catch (error) {
        console.error(`Error parsing specification for key ${key}:`, error);
        return null;
      }
    })
    .filter((spec) => spec !== null);

  // Log parsed specifications for debugging
  if (specifications.length === 0) {
    throw new Error("No valid specifications provided.");
  }

  const connection = await getConnection();

  try {
    const specificationIds: number[] = [];

    // Check if specifications exist or insert them
    for (const spec of specifications) {
      const [existingSpec]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          `SELECT specification_id FROM specifications WHERE specification_name = ? LIMIT 1`,
          [spec.specification_name]
        );

      let specificationId: number;

      if (existingSpec.length > 0) {
        // Specification exists, use its ID
        specificationId = existingSpec[0].specification_id;
      } else {
        // Specification does not exist, insert it and get the ID
        const [insertResult]: [any, any] = await connection.query(
          `INSERT INTO specifications (specification_name) VALUES (?)`,
          [spec.specification_name]
        );
        specificationId = insertResult.insertId; // Access insertId from ResultSetHeader
      }

      specificationIds.push(specificationId);

      // Insert into category_specifications table
      await connection.query(
        `INSERT IGNORE INTO category_specifications (category_id, specification_id) VALUES (?, ?)`,
        [categoryId, specificationId]
      );
    }

    // Insert into product_specifications table
    const productSpecInsertValues = specifications.map((spec, index) => [
      productId,
      specificationIds[index],
      spec.specification_value,
    ]);

    await connection.query(
      `INSERT INTO product_specifications (product_id, specification_id, value) VALUES ?`,
      [productSpecInsertValues]
    );
  } catch (error) {
    console.error("Error adding specifications:", error);
    throw new Error("Failed to add specifications.");
  } finally {
    connection.release();
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
