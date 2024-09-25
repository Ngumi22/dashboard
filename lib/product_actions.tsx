"use server";

import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getConnection } from "./db";
import { NextResponse } from "next/server";
import validator from "validator";
import { Specification } from "./types";

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Utility function to validate image files
function validateImageFile(
  file: File,
  maxSize: number,
  allowedTypes: string[]
): { valid: boolean; message: string } {
  if (file.size > maxSize || !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File must be less than ${
        maxSize / 1024
      }KB and in allowed formats: ${allowedTypes.join(", ")}.`,
    };
  }
  return { valid: true, message: "File is valid." };
}

// Function to add a category
export async function addCategory(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    const name = validator.escape(formData.get("name") as string);
    const description = validator.escape(formData.get("description") as string);
    const categoryImage = formData.get("category_image") as File;
    const createdBy = formData.get("created_by")
      ? Number(formData.get("created_by"))
      : null;
    const updatedBy = formData.get("updated_by")
      ? Number(formData.get("updated_by"))
      : null;

    // Validation: Ensure required fields are present
    if (!name || !description || !categoryImage) {
      throw new CustomError("Name, description, and image are required.", 400);
    }

    const validationResult = validateImageFile(categoryImage, 100 * 1024, [
      "image/jpeg",
      "image/png",
    ]);
    if (!validationResult.valid) {
      throw new CustomError(validationResult.message, 400);
    }

    const [existingCategory]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT category_id FROM categories WHERE name = ?",
        [name]
      );

    if (existingCategory.length > 0) {
      throw new CustomError("Category already exists.", 409);
    }

    const categoryImageBuffer = Buffer.from(await categoryImage.arrayBuffer());

    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO categories (name, category_image, description, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name, categoryImageBuffer, description, createdBy, updatedBy]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      categoryId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();

    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the category.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Function to add a brand
export async function addBrand(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize brand details
    const name = validator.escape(formData.get("name") as string);
    const brand_logo = formData.get("brand_logo") as File;
    const created_by = formData.get("created_by")
      ? Number(formData.get("created_by"))
      : null;
    const updated_by = formData.get("updated_by")
      ? Number(formData.get("updated_by"))
      : null;

    // Validate required fields
    if (!name || !brand_logo) {
      throw new CustomError("Name and brand logo are required.", 400);
    }

    // Validate the brand logo using the utility function
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 100 * 1024; // 100KB limit for image files
    const validationResult = validateImageFile(
      brand_logo,
      maxSize,
      allowedTypes
    );
    if (!validationResult.valid) {
      throw new CustomError(validationResult.message, 400);
    }

    // Check if the brand already exists
    const [existingBrand]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT brand_id FROM brands WHERE name = ?", [
        name,
      ]);

    if (existingBrand.length > 0) {
      throw new CustomError("Brand already exists.", 409);
    }

    // Convert brand_logo to binary data (Buffer)
    const brandLogoBuffer = await brand_logo.arrayBuffer();
    const brandLogoBinary = Buffer.from(brandLogoBuffer);

    // Insert new brand into the database
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO brands (name, brand_logo, created_by, updated_by) VALUES (?, ?, ?, ?)`,
      [name, brandLogoBinary, created_by, updated_by]
    );

    // Commit transaction and respond with success
    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Brand added successfully.",
      brandId: result.insertId,
    });
  } catch (error) {
    // Rollback the transaction on error
    await connection.rollback();

    // Handle custom errors
    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    // Log and respond with a generic error for unexpected issues
    console.error("An error occurred:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while adding the brand." },
      { status: 500 }
    );
  } finally {
    // Always release the connection
    connection.release();
  }
}

// Create Supplier Function
export async function createSupplier(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString() || null; // Email is optional
    const contactInfo = formData.get("contact_info")?.toString() || null; // Contact info is optional
    const created_by = formData.get("created_by")
      ? Number(formData.get("created_by"))
      : null;
    const updated_by = formData.get("updated_by")
      ? Number(formData.get("updated_by"))
      : null;

    // Input validation
    if (!name) {
      throw new CustomError("Name is required.", 400);
    }

    // Validate email format if provided
    if (email && !validator.isEmail(email)) {
      throw new CustomError("Invalid email format.", 400);
    }

    // Check if the email already exists in the database
    if (email) {
      const [existingSupplierRows] = await connection.query<RowDataPacket[]>(
        "SELECT supplier_id FROM suppliers WHERE email = ?",
        [email]
      );

      if (existingSupplierRows.length > 0) {
        throw new CustomError(
          "A supplier with this email already exists.",
          400
        );
      }
    }

    // Insert the supplier into the database
    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO suppliers (name, email, contact_info, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
      [name, email, contactInfo, created_by, updated_by]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Supplier created successfully.",
      supplierId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the supplier.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
// Function to create a product-supplier mapping
// Create Product-Supplier Mapping Function
export async function createProductSupplierMapping(
  productId: number,
  supplierId: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Check if the product and supplier exist in one query
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM products WHERE product_id = ?) AS productExists,
        (SELECT COUNT(*) FROM suppliers WHERE supplier_id = ?) AS supplierExists`,
      [productId, supplierId]
    );

    const { productExists, supplierExists } = rows[0];

    if (!productExists) {
      throw new CustomError(
        `Product with ID ${productId} does not exist.`,
        404
      );
    }

    if (!supplierExists) {
      throw new CustomError(
        `Supplier with ID ${supplierId} does not exist.`,
        404
      );
    }

    // Insert the mapping into the product_suppliers table
    await connection.query<ResultSetHeader>(
      "INSERT INTO product_suppliers (product_id, supplier_id) VALUES (?, ?)",
      [productId, supplierId]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product-supplier mapping created successfully.",
    });
  } catch (error) {
    await connection.rollback();
    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred while creating the product-supplier mapping.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Product Images
export async function createProductImages(
  formData: FormData,
  productId: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and validate product_id
    const product_id = productId;
    if (!product_id) {
      throw new CustomError("Product ID is required.", 400);
    }

    // Extract image files from formData
    const main_image = formData.get("mainImage") as File;
    const thumbnails = formData.getAll("thumbnails") as File[];

    // Validate that the correct number of thumbnails are provided
    if (thumbnails.length !== 5) {
      throw new CustomError("Exactly 5 thumbnails are required.", 400);
    }

    // Validate image files using the existing utility
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 100 * 1024; // 100KB limit for image files

    // Validate all images
    const allFiles = [main_image, ...thumbnails];
    for (const file of allFiles) {
      if (file) {
        const validationResult = validateImageFile(file, maxSize, allowedTypes);
        if (!validationResult.valid) {
          await connection.rollback();
          return NextResponse.json(
            { success: false, message: validationResult.message },
            { status: 400 }
          );
        }
      }
    }

    // Convert images to buffers
    const mainImageBuffer = main_image
      ? Buffer.from(await main_image.arrayBuffer())
      : null;
    const thumbnailBuffers = await Promise.all(
      thumbnails.map(async (thumbnail) =>
        thumbnail ? Buffer.from(await thumbnail.arrayBuffer()) : null
      )
    );

    // Ensure all necessary buffers are present
    if (!mainImageBuffer || thumbnailBuffers.includes(null)) {
      throw new CustomError("Image processing failed.", 500);
    }

    // Insert images into the database with the product_id
    const query = `
      INSERT INTO product_images
        (product_id, main_image, thumbnail_image1, thumbnail_image2, thumbnail_image3, thumbnail_image4, thumbnail_image5)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      query,
      [product_id, mainImageBuffer, ...thumbnailBuffers]
    );

    // Check if the insertion was successful
    if (!result.insertId) {
      throw new Error("Failed to insert images.");
    }

    // Commit the transaction and respond
    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully.",
      imageId: result.insertId,
    });
  } catch (error) {
    // Rollback the transaction on error
    await connection.rollback();

    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("An error occurred:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while uploading images." },
      { status: 500 }
    );
  } finally {
    // Release the database connection
    connection.release();
  }
}

// Product Tags
export async function manageProductTags(formData: FormData, productId: number) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Parse the tags array from formData
    const tags: string[] = JSON.parse(formData.get("tags") as string);
    const created_by = formData.get("created_by")
      ? Number(formData.get("created_by"))
      : null;
    const updated_by = formData.get("updated_by")
      ? Number(formData.get("updated_by"))
      : null;

    // Input validation
    if (!tags || tags.length === 0) {
      throw new CustomError("At least one tag is required.", 400);
    }

    // Validate the existence of the product
    const [productRows] = await connection.query<RowDataPacket[]>(
      "SELECT product_id FROM products WHERE product_id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      throw new CustomError(
        `Product with ID ${productId} does not exist.`,
        404
      );
    }

    // Use an array to ensure unique tags and avoid duplicate database calls
    const uniqueTags: string[] = Array.from(
      new Set(tags.map((tag) => validator.escape(tag)).filter((tag) => tag))
    );

    const tagIds: number[] = [];

    // Loop through each unique tag to create or find it
    for (const sanitizedTagName of uniqueTags) {
      // Insert a new tag with a unique constraint
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO tags (name, created_by, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tag_id = LAST_INSERT_ID(tag_id)",
        [sanitizedTagName, created_by, updated_by]
      );
      tagIds.push(result.insertId); // This will return the tag_id whether it's new or existing
    }

    // Bulk insert product-tag mappings
    const productTagValues = tagIds.map((tagId) => [productId, tagId]);

    // Use INSERT IGNORE to prevent duplicates in product_tags
    await connection.query(
      "INSERT IGNORE INTO product_tags (product_id, tag_id) VALUES ?",
      [productTagValues]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product tags managed successfully.",
    });
  } catch (error) {
    await connection.rollback();
    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while managing product tags.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Specifications
export async function createProductSpecifications(
  formData: FormData,
  productId: number,
  categoryId: number // Add categoryId as a parameter
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    const specifications: Specification[] = JSON.parse(
      formData.get("specifications") as string
    );
    const created_by = formData.get("created_by")
      ? Number(formData.get("created_by"))
      : null;
    const updated_by = formData.get("updated_by")
      ? Number(formData.get("updated_by"))
      : null;

    if (!specifications || specifications.length === 0) {
      throw new CustomError("At least one specification is required.", 400);
    }

    // Loop through each specification
    for (const spec of specifications) {
      const specificationName = validator.escape(spec.name);
      const specificationValue = validator.escape(spec.value);

      if (!specificationName || !specificationValue) {
        throw new CustomError(
          "Both specification name and value are required.",
          400
        );
      }

      // Check if the specification already exists
      const [existingSpec]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          "SELECT specification_id FROM specifications WHERE name = ?",
          [specificationName]
        );

      let specificationId: number;

      if (existingSpec.length > 0) {
        // Reuse existing specification
        specificationId = existingSpec[0].specification_id;
      } else {
        // Create a new specification
        const [result]: [ResultSetHeader, FieldPacket[]] =
          await connection.query(
            `INSERT INTO specifications (name, created_by, updated_by)
           VALUES (?, ?, ?)`,
            [specificationName, created_by, updated_by]
          );
        specificationId = result.insertId;

        // Associate the new specification with the category
        await connection.query(
          `INSERT INTO category_specifications (category_id, specification_id)
           VALUES (?, ?)`,
          [categoryId, specificationId]
        );
      }

      // Insert product specification mapping
      await connection.query(
        `INSERT INTO product_specifications (product_id, specification_id, value, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, specificationId, specificationValue, created_by, updated_by]
      );
    }

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product specifications created successfully.",
    });
  } catch (error) {
    await connection.rollback();
    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating product specifications.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Create or update variant with images
export async function createVariantWithImages(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and validate product_id and variant_type_id
    const productId = parseInt(formData.get("product_id") as string, 10);
    const variantTypeId = parseInt(
      formData.get("variant_type_id") as string,
      10
    );
    const value = validator.escape(formData.get("value") as string);
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const status = validator.escape(formData.get("status") as string);
    const created_by = formData.get("created_by")
      ? Number(formData.get("created_by"))
      : null;
    const updated_by = formData.get("updated_by")
      ? Number(formData.get("updated_by"))
      : null;

    // Input validation
    if (!productId || !variantTypeId || !value) {
      throw new CustomError(
        "Product ID, variant type, and value are required.",
        400
      );
    }

    // Insert variant into the database
    const [variantResult]: [ResultSetHeader, FieldPacket[]] =
      await connection.query(
        `INSERT INTO variants (product_id, variant_type_id, value, price, quantity, status, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          variantTypeId,
          value,
          price,
          quantity,
          status,
          created_by,
          updated_by,
        ]
      );

    const variantId = variantResult.insertId;
    if (!variantId) {
      throw new CustomError("Failed to create variant.", 500);
    }

    // Extract and validate image files
    const variantImage = formData.get("variant_image") as File;
    const thumbnails = Array.from(
      formData.getAll("variant_thumbnail") as File[]
    );

    // Validate thumbnail count
    if (thumbnails.length > 5) {
      throw new CustomError("A maximum of 5 thumbnails are allowed.", 400);
    }

    // Validate images
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 100 * 1024; // 100KB limit for image files

    const allFiles = [variantImage, ...thumbnails];
    for (const file of allFiles) {
      if (file) {
        const validationResult = validateImageFile(file, maxSize, allowedTypes);
        if (!validationResult.valid) {
          throw new CustomError(validationResult.message, 400);
        }
      }
    }

    // Convert images to buffers
    const variantImageBuffer = variantImage
      ? Buffer.from(await variantImage.arrayBuffer())
      : null;
    const thumbnailBuffers = await Promise.all(
      thumbnails.map(async (thumbnail) =>
        thumbnail ? Buffer.from(await thumbnail.arrayBuffer()) : null
      )
    );

    // Check for null buffers
    if (!variantImageBuffer || thumbnailBuffers.includes(null)) {
      throw new CustomError("Image processing failed.", 500);
    }

    // Insert images into the database
    const query = `
      INSERT INTO product_variant_images
        (variant_id, variant_image, variant_thumbnail1, variant_thumbnail2, variant_thumbnail3, variant_thumbnail4, variant_thumbnail5)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [imageResult]: [ResultSetHeader, FieldPacket[]] =
      await connection.query(query, [
        variantId,
        variantImageBuffer,
        ...thumbnailBuffers,
      ]);

    if (!imageResult.insertId) {
      throw new CustomError("Failed to insert variant images.", 500);
    }

    // Commit the transaction and respond
    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Variant created and images uploaded successfully.",
      variantId,
      imageId: imageResult.insertId,
    });
  } catch (error) {
    // Rollback on error
    await connection.rollback();

    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the variant.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
