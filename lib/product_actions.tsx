"use server";

import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getConnection } from "./db";
import { NextResponse } from "next/server";
import validator from "validator";
import { Brand, Specification, Tag } from "./types";
import { validateFiles } from "./utils";

// Custom error class for better error handling
class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

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
// Category function
export async function addCategory(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize formData inputs
    const name = validator.escape(formData.get("name") as string);
    const description = validator.escape(formData.get("description") as string);
    const category_image = formData.get("category_image") as File;
    const created_by = Number(formData.get("created_by"));
    const updated_by = Number(formData.get("updated_by"));

    // Validation: Ensure required fields are present
    if (!name || !description || !category_image) {
      throw new CustomError("Name, description, and image are required.", 400);
    }

    // Validate the image using the utility function
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 100 * 1024; // 100KB max size

    const validationResult = validateImageFile(
      category_image,
      maxSize,
      allowedTypes
    );
    if (!validationResult.valid) {
      throw new CustomError(validationResult.message, 400);
    }

    // Check if category already exists
    const [existingCategory]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT category_id FROM categories WHERE name = ?",
        [name]
      );

    if (existingCategory.length > 0) {
      throw new CustomError("Category already exists.", 409);
    }

    // Convert image to buffer
    const categoryImageBuffer = await category_image.arrayBuffer();
    const imageBuffer = Buffer.from(categoryImageBuffer);

    // Insert the new category into the database
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO categories (name, category_image, description, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name, imageBuffer, description, created_by || null, updated_by || null]
    );

    // Commit transaction and respond
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      categoryId: result.insertId,
    });
  } catch (error) {
    // Rollback on error and handle it properly
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

export async function addBrand(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize brand details
    const name = validator.escape(formData.get("name") as string);
    const brand_logo = formData.get("brand_logo") as File;
    const created_by = formData.get("created_by") as string; // Assumes this comes from an authenticated user

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
      `INSERT INTO brands (name, brand_logo, created_by) VALUES (?, ?, ?)`,
      [name, brandLogoBinary, created_by]
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

export async function createSupplier(
  formData: FormData,
  createdBy: number,
  updatedBy: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize supplier name and contact info
    const supplierName = validator.escape(formData.get("name") as string);
    const contactInfo = (formData.get("contact_info") as string)
      ? validator.escape(formData.get("contact_info") as string)
      : null; // Contact info can be optional, so we handle it accordingly

    // Input validation: Ensure supplier name is present
    if (!supplierName) {
      throw new CustomError("Supplier name is required.", 400);
    }

    // Check if the supplier already exists in the database
    const [existingSupplier]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT supplier_id FROM suppliers WHERE name = ?",
        [supplierName]
      );

    if (existingSupplier.length > 0) {
      throw new CustomError("Supplier already exists.", 409);
    }

    // Insert the new supplier into the database
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO suppliers (name, contact_info, created_by, updated_by)
       VALUES (?, ?, ?, ?)`,
      [supplierName, contactInfo, createdBy, updatedBy]
    );

    // Commit transaction if all goes well
    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Supplier created successfully.",
      supplierId: result.insertId,
    });
  } catch (error) {
    // Rollback transaction on any error
    await connection.rollback();

    // Handle custom errors
    if (error instanceof CustomError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    // Log unexpected errors and return a generic error message
    console.error("An error occurred:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the supplier.",
      },
      { status: 500 }
    );
  } finally {
    // Always release the connection
    connection.release();
  }
}

export async function createProductSupplier(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize product and supplier IDs
    const productId = parseInt(formData.get("product_id") as string, 10);
    const supplierId = parseInt(formData.get("supplier_id") as string, 10);

    // Input validation
    if (!productId || !supplierId) {
      throw new CustomError("Product ID and Supplier ID are required.", 400);
    }

    // Validate product and supplier existence
    const [[productRows], [supplierRows]] = await Promise.all([
      connection.query<RowDataPacket[]>(
        "SELECT product_id FROM products WHERE product_id = ?",
        [productId]
      ),
      connection.query<RowDataPacket[]>(
        "SELECT supplier_id FROM suppliers WHERE supplier_id = ?",
        [supplierId]
      ),
    ]);

    // Check if product exists
    if (productRows.length === 0) {
      throw new Error(`Product with ID ${productId} does not exist.`);
    }

    // Check if supplier exists
    if (supplierRows.length === 0) {
      throw new Error(`Supplier with ID ${supplierId} does not exist.`);
    }

    // Insert mapping into the database
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO product_suppliers (product_id, supplier_id)
       VALUES (?, ?)`,
      [productId, supplierId]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product-Supplier mapping created successfully.",
      mappingId: result.insertId,
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

// continue from here
export async function createTag(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize tag name
    const tagName = validator.escape(formData.get("tag_name") as string);

    // Input validation
    if (!tagName) {
      throw new CustomError("Tag name is required.", 400);
    }

    // Check if tag already exists
    const [tagRows] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM tags WHERE name = ?",
      [tagName]
    );

    if (tagRows.length > 0) {
      throw new CustomError("Tag already exists.", 409);
    }

    // Insert tag into the database
    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO tags (name) VALUES (?)",
      [tagName]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Tag created successfully.",
      tagId: result.insertId,
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
      { success: false, message: "An error occurred while creating the tag." },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function createProductTags(
  formData: FormData,
  productId: number,
  createdBy: number,
  updatedBy: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Parse the tags array from formData
    const tags: { name: string }[] = JSON.parse(formData.get("tags") as string);

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

    // Loop through each tag and insert or update
    for (const tag of tags) {
      const tagName = validator.escape(tag.name);

      if (!tagName) {
        throw new CustomError("Tag name is required.", 400);
      }

      // Check if the tag already exists
      const [existingTagRows] = await connection.query<RowDataPacket[]>(
        "SELECT tag_id FROM tags WHERE name = ?",
        [tagName]
      );

      let tagId: number;

      if (existingTagRows.length > 0) {
        // Reuse existing tag
        tagId = existingTagRows[0].tag_id;
      } else {
        // Insert a new tag
        const [result] = await connection.query<ResultSetHeader>(
          "INSERT INTO tags (name, created_by, updated_by) VALUES (?, ?, ?)",
          [tagName, createdBy, updatedBy]
        );
        tagId = result.insertId;
      }

      // Insert product-tag mapping
      await connection.query(
        "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
        [productId, tagId]
      );
    }

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Product tags created successfully.",
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
        message: "An error occurred while creating product tags.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function uploadImages(formData: FormData) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract files from formData
    const main_image = formData.get("main_image") as File;
    const thumbnail1 = formData.get("thumbnail1") as File;
    const thumbnail2 = formData.get("thumbnail2") as File;
    const thumbnail3 = formData.get("thumbnail3") as File;
    const thumbnail4 = formData.get("thumbnail4") as File;
    const thumbnail5 = formData.get("thumbnail5") as File;

    // Validate files using the existing function
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 100 * 1024; // 100KB

    const files = [
      main_image,
      thumbnail1,
      thumbnail2,
      thumbnail3,
      thumbnail4,
      thumbnail5,
    ];

    // Validate each file
    for (const file of files) {
      if (file) {
        const validationResult = validateImageFile(file, maxSize, allowedTypes);
        if (!validationResult.valid) {
          await connection.rollback();
          console.log("File validation failed.");
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
      [thumbnail1, thumbnail2, thumbnail3, thumbnail4, thumbnail5].map(
        async (thumbnail) =>
          thumbnail ? Buffer.from(await thumbnail.arrayBuffer()) : null
      )
    );

    // Insert images into the database
    const query = `
      INSERT INTO product_images (main_image, thumbnail1, thumbnail2, thumbnail3, thumbnail4, thumbnail5)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      query,
      [mainImageBuffer, ...thumbnailBuffers]
    );

    if (!result.insertId) {
      throw new Error("Failed to insert images");
    }

    const imageId = result.insertId;

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully.",
      imageId,
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
      { success: false, message: "An error occurred while uploading images." },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function createProductSpecifications(
  formData: FormData,
  productId: number,
  createdBy: number,
  updatedBy: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    const specifications: Specification[] = JSON.parse(
      formData.get("specifications") as string
    );

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
            [specificationName, createdBy, updatedBy]
          );
        specificationId = result.insertId;
      }

      // Insert product specification mapping
      await connection.query(
        `INSERT INTO product_specifications (product_id, specification_id, value, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, specificationId, specificationValue, createdBy, updatedBy]
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

export async function uploadVariantImages(
  formData: FormData,
  variantId: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract variant images from formData
    const variant_image = formData.get("variant_image") as File;
    const variant_thumbnail1 = formData.get("variant_thumbnail1") as File;
    const variant_thumbnail2 = formData.get("variant_thumbnail2") as File;
    const variant_thumbnail3 = formData.get("variant_thumbnail3") as File;
    const variant_thumbnail4 = formData.get("variant_thumbnail4") as File;
    const variant_thumbnail5 = formData.get("variant_thumbnail5") as File;

    // Validate the files
    const filesToValidate = [
      variant_image,
      variant_thumbnail1,
      variant_thumbnail2,
      variant_thumbnail3,
      variant_thumbnail4,
      variant_thumbnail5,
    ].filter(Boolean);

    const { valid, message } = validateFiles(filesToValidate);
    if (!valid) {
      throw new CustomError("File validation failed: " + message, 400);
    }

    // Check image size and type
    const checkImage = (file: File) =>
      file.size <= 100 * 1024 &&
      ["image/jpeg", "image/png"].includes(file.type);

    const allImagesValid = [
      variant_image,
      variant_thumbnail1,
      variant_thumbnail2,
      variant_thumbnail3,
      variant_thumbnail4,
      variant_thumbnail5,
    ]
      .filter(Boolean)
      .every(checkImage);

    if (!allImagesValid) {
      throw new CustomError(
        `Images must be less than 100KB and in JPEG or PNG format. + ${message}`,
        400
      );
    }

    // Insert images into the database
    const variantImageBuffer = variant_image
      ? Buffer.from(await variant_image.arrayBuffer())
      : null;
    const variantThumbnailBuffers = await Promise.all(
      [
        variant_thumbnail1,
        variant_thumbnail2,
        variant_thumbnail3,
        variant_thumbnail4,
        variant_thumbnail5,
      ].map(async (variant_thumbnail) =>
        variant_thumbnail
          ? Buffer.from(await variant_thumbnail.arrayBuffer())
          : null
      )
    );

    const query = `
      INSERT INTO product_variant_images (variant_id, variant_image, variant_thumbnail1, variant_thumbnail2, variant_thumbnail3, variant_thumbnail4, variant_thumbnail5)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      query,
      [variantId, variantImageBuffer, ...variantThumbnailBuffers]
    );

    if (!result.insertId) {
      throw new CustomError("Failed to insert variant images.", 500);
    }

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Variant images uploaded successfully.",
      variantImageId: result.insertId,
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
        message: "An error occurred while uploading variant images.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function createVariantType(
  formData: FormData,
  createdBy: number,
  updatedBy: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize variant type data
    const name = validator.escape(formData.get("name") as string);
    const description = validator.escape(formData.get("description") as string);

    // Input validation
    if (!name) {
      throw new CustomError("Variant type name is required.", 400);
    }

    // Check if the variant type already exists
    const [existingVariantType]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT variant_type_id FROM variant_types WHERE name = ?",
        [name]
      );

    if (existingVariantType.length > 0) {
      throw new CustomError("Variant type already exists.", 409);
    }

    // Insert the variant type into the database
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO variant_types (name, description, created_by, updated_by)
       VALUES (?, ?, ?, ?)`,
      [name, description, createdBy, updatedBy]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Variant type created successfully.",
      variantTypeId: result.insertId,
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
        message: "An error occurred while creating the variant type.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function createVariant(
  formData: FormData,
  createdBy: number,
  updatedBy: number
) {
  const connection = await getConnection();
  await connection.beginTransaction();

  try {
    // Extract and sanitize product and variant data
    const productId = parseInt(formData.get("product_id") as string, 10);
    const variantTypeId = parseInt(
      formData.get("variant_type_id") as string,
      10
    );
    const value = validator.escape(formData.get("value") as string);
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const status = validator.escape(formData.get("status") as string);

    // Input validation
    if (!productId || !variantTypeId || !value) {
      throw new CustomError(
        "Product ID, variant type, and value are required.",
        400
      );
    }

    // Insert variant into the database
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
      `INSERT INTO variants (product_id, variant_type_id, value, price, quantity, status, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        variantTypeId,
        value,
        price,
        quantity,
        status,
        createdBy,
        updatedBy,
      ]
    );

    await connection.commit();
    return NextResponse.json({
      success: true,
      message: "Variant created successfully.",
      variantId: result.insertId,
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
        message: "An error occurred while creating the variant.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
