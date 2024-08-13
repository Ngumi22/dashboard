"use server";

import mysql, { FieldPacket, RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { signUpSchema, validateFiles } from "./utils";
import { getConnection } from "./db";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "./sessions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import validator from "validator";
import { FileData, FormState, LoginFormSchema } from "./definitions";
import { sendVerificationEmail } from "./emailVerification";
import { setupTables } from "./dbTables";

export async function handlePost(request: NextRequest) {
  const connection = await getConnection();

  try {
    console.log("Starting transaction...");
    await connection.beginTransaction();

    // Ensure tables exist
    await setupTables();
    console.log("Tables checked/created.");

    const formData = await request.formData();
    console.log(`FormData entries: ${JSON.stringify([formData.entries()])}`); // Debugging: Log all FormData entries

    const fields = Object.fromEntries(formData.entries());
    console.log(`Form fields: ${JSON.stringify(fields)}`); // Debugging: Log form fields

    // Extract and validate numeric fields
    const price = parseFloat(fields.price as string);
    const discount = parseFloat(fields.discount as string);
    const quantity = parseInt(fields.quantity as string, 10);

    if (
      isNaN(price) ||
      price < 0 ||
      isNaN(discount) ||
      discount < 0 ||
      isNaN(quantity) ||
      quantity < 0
    ) {
      await connection.rollback();
      console.log("Invalid numeric fields.");
      return NextResponse.json(
        {
          success: false,
          message:
            "Price, discount, and quantity must be valid numbers and not less than zero",
        },
        { status: 400 }
      );
    }

    // Extract files from formData
    const main_image = formData.get("main_image") as File;
    const thumbnail1 = formData.get("thumbnail1") as File;
    const thumbnail2 = formData.get("thumbnail2") as File;
    const thumbnail3 = formData.get("thumbnail3") as File;
    const thumbnail4 = formData.get("thumbnail4") as File;
    const thumbnail5 = formData.get("thumbnail5") as File;

    // Validate files
    const filesToValidate = [
      main_image,
      thumbnail1,
      thumbnail2,
      thumbnail3,
      thumbnail4,
      thumbnail5,
    ].filter(Boolean);

    const { valid, message } = validateFiles(filesToValidate);
    if (!valid) {
      await connection.rollback();
      console.log("File validation failed.");
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    // Check image size and type
    const checkImage = (file: File) =>
      file.size <= 100 * 1024 &&
      ["image/jpeg", "image/png"].includes(file.type);

    const allImagesValid = [
      main_image,
      thumbnail1,
      thumbnail2,
      thumbnail3,
      thumbnail4,
      thumbnail5,
    ]
      .filter(Boolean)
      .every(checkImage);

    if (!allImagesValid) {
      await connection.rollback();
      console.log("Image validation failed.");
      return NextResponse.json(
        {
          success: false,
          message:
            "All images must be less than 100KB and in JPEG or PNG format.",
        },
        { status: 400 }
      );
    }

    // Input validation to prevent SQL injection and other vulnerabilities
    const sanitizeInput = (input: string) => validator.escape(input);
    const fileData: FileData = {
      main_image,
      thumbnail1,
      thumbnail2,
      thumbnail3,
      thumbnail4,
      thumbnail5,
      fields: {
        sku: sanitizeInput(fields.sku as string),
        name: sanitizeInput(fields.name as string),
        description: sanitizeInput(fields.description as string),
        category: sanitizeInput(fields.category as string),
        status: fields.status as "Archived" | "Active" | "Draft",
        price: price,
        discount: discount,
        quantity: quantity,
        brand: sanitizeInput(fields.brand as string),
      },
    };

    const { sku, name, description, category, status, brand } = fileData.fields;

    // Handle product tags
    let tags: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Assume a maximum of 10 tags
      const tag = fields[`tags[${i}]`];
      if (tag) {
        tags.push((tag as string).trim());
      }
    }

    console.log(`Tags extracted: ${JSON.stringify(tags)}`); // Debugging: Log the tags array

    // Check if a product with the same sku already exists
    const [existingProducts]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT id FROM product WHERE sku = ? FOR UPDATE",
        [sku]
      );

    if (existingProducts.length > 0) {
      await connection.rollback();
      console.log("Product with this SKU already exists.");
      return NextResponse.json(
        { success: false, message: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    // Check if the category exists, if not, insert it
    let [categoryRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT id FROM categories WHERE name = ? FOR UPDATE",
        [category]
      );

    let categoryId: number;
    if (categoryRows.length === 0) {
      const [categoryResult]: [any, any] = await connection.query(
        "INSERT INTO categories (name) VALUES (?)",
        [category]
      );
      categoryId = categoryResult.insertId;
      console.log(`Inserted new category with ID: ${categoryId}`);
    } else {
      categoryId = categoryRows[0].id;
      console.log(`Found existing category with ID: ${categoryId}`);
    }

    // Insert images
    const mainImageBuffer = main_image
      ? Buffer.from(await main_image.arrayBuffer())
      : null;
    const thumbnailBuffers = await Promise.all(
      [thumbnail1, thumbnail2, thumbnail3, thumbnail4, thumbnail5].map(
        async (thumbnail) =>
          thumbnail ? Buffer.from(await thumbnail.arrayBuffer()) : null
      )
    );

    const query = `
      INSERT INTO images (main_image, thumbnail1, thumbnail2, thumbnail3, thumbnail4, thumbnail5)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result]: [any, any] = await connection.query(query, [
      mainImageBuffer,
      ...thumbnailBuffers,
    ]);

    if (!result.insertId) {
      throw new Error("Failed to insert images");
    }

    const imageId = result.insertId;
    console.log(`Inserted images with ID: ${imageId}`);

    // Insert product
    const productQuery = `
      INSERT INTO product (sku, name, description, category_id, status, image_id, price, discount, brand, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [productResult]: [any, any] = await connection.query(productQuery, [
      sku,
      name,
      description,
      categoryId,
      status,
      imageId,
      price,
      discount,
      brand,
      quantity,
    ]);

    const productId = productResult.insertId;
    console.log(`Inserted product with ID: ${productId}`);

    // Insert tags
    for (const tag of tags) {
      console.log(`Processing tag: ${tag}`); // Debugging: Log each tag being processed

      let [tagRows]: [RowDataPacket[], FieldPacket[]] = await connection.query(
        "SELECT id FROM tags WHERE name = ? FOR UPDATE",
        [tag]
      );

      console.log(`Tag query result: ${JSON.stringify(tagRows)}`); // Debugging: Log query result

      let tagId: number;
      if (tagRows.length === 0) {
        const [tagResult]: [any, any] = await connection.query(
          "INSERT INTO tags (name) VALUES (?)",
          [tag]
        );
        tagId = tagResult.insertId;
        console.log(`Inserted new tag with ID: ${tagId}`); // Debugging: Log new tag ID
      } else {
        tagId = tagRows[0].id;
        console.log(`Found existing tag with ID: ${tagId}`); // Debugging: Log existing tag ID
      }

      await connection.query(
        "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
        [productId, tagId]
      );

      console.log(
        `Inserted product-tag relation for product ${productId} and tag ${tagId}`
      ); // Debugging: Log relation
    }

    await connection.commit();
    console.log("Transaction committed.");

    // Revalidate the necessary paths
    await revalidatePath(`http://localhost:3000/dashboard/products`);
    console.log("Path revalidation triggered.");

    // Redirect to the product detail page
    return NextResponse.redirect(`/dashboard/products/${productId}`);
  } catch (error: any) {
    await connection.rollback();
    console.error("Error in handlePost:", error.message);
    return NextResponse.json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  } finally {
    connection.release();
    console.log("Connection released.");
  }
}

// Function to update a product
export async function handlePut(req: NextRequest, id: string) {
  const connection = await getConnection();

  try {
    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());
    const {
      sku,
      name,
      description,
      brand,
      category,
      status,
      price,
      discount,
      quantity,
    } = fields;

    // Validation for negative values
    const priceValue = Number(price);
    const discountValue = Number(discount);
    const quantityValue = Number(quantity);

    if (priceValue < 0 || discountValue < 0 || quantityValue < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price, discount, and quantity cannot be negative",
        },
        { status: 400 }
      );
    }

    // Fetch category ID based on category name
    const [categoryRows] = await connection.execute(
      "SELECT id FROM categories WHERE name = ?",
      [category]
    );

    // Ensure categoryRows is an array of objects with an 'id' property
    if (
      !Array.isArray(categoryRows) ||
      categoryRows.length === 0 ||
      !("id" in categoryRows[0])
    ) {
      // Category not found
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryId = categoryRows[0].id;

    // Start transaction
    await connection.beginTransaction();

    try {
      // Update product details using parameterized query
      await connection.execute(
        "UPDATE product SET sku = ?, name = ?, description = ?, brand = ?, category_id = ?, status = ?, price = ?, discount = ?, quantity = ? WHERE id = ?",
        [
          sku,
          name,
          description,
          brand,
          categoryId,
          status,
          price,
          discount,
          quantity,
          id,
        ]
      );

      // Handle image updates
      const main_image = formData.get("main_image") as File;
      const thumbnail1 = formData.get("thumbnail1") as File;
      const thumbnail2 = formData.get("thumbnail2") as File;
      const thumbnail3 = formData.get("thumbnail3") as File;
      const thumbnail4 = formData.get("thumbnail4") as File;
      const thumbnail5 = formData.get("thumbnail5") as File;

      if (main_image) {
        const mainImageBuffer = Buffer.from(await main_image.arrayBuffer());

        await connection.execute(
          "UPDATE images SET main_image = ? WHERE id = (SELECT image_id FROM product WHERE id = ?)",
          [mainImageBuffer, id]
        );
      }

      const thumbnails = [
        thumbnail1,
        thumbnail2,
        thumbnail3,
        thumbnail4,
        thumbnail5,
      ];
      if (thumbnails.some((thumbnail) => thumbnail)) {
        const thumbnailBuffers = await Promise.all(
          thumbnails.map(async (thumbnail) =>
            thumbnail ? Buffer.from(await thumbnail.arrayBuffer()) : null
          )
        );

        await connection.execute(
          "UPDATE images SET thumbnail1 = ?, thumbnail2 = ?, thumbnail3 = ?, thumbnail4 = ?, thumbnail5 = ? WHERE id = (SELECT image_id FROM product WHERE id = ?)",
          [...thumbnailBuffers, id]
        );
      }

      // Handle tag updates
      const newTags: string[] = [];
      formData.forEach((value, key) => {
        if (key.startsWith("tags[")) {
          newTags.push(value as string);
        }
      });

      // Fetch existing tags
      const [existingTagsRows] = await connection.execute(
        "SELECT t.id, t.name FROM tags t JOIN product_tags pt ON t.id = pt.tag_id WHERE pt.product_id = ?",
        [id]
      );

      const existingTags = existingTagsRows as { id: number; name: string }[];
      const existingTagNames = existingTags.map((tag) => tag.name);

      // Determine tags to add and remove
      const tagsToAdd = newTags.filter(
        (tag) => !existingTagNames.includes(tag.trim())
      );
      const tagsToRemove = existingTags.filter(
        (tag) => !newTags.includes(tag.name)
      );

      // Remove old tags
      for (const tag of tagsToRemove) {
        await connection.execute(
          "DELETE FROM product_tags WHERE product_id = ? AND tag_id = ?",
          [id, tag.id]
        );
      }

      // Add new tags
      for (const tagName of tagsToAdd) {
        const trimmedTagName = tagName.trim();

        const [tagRows]: [RowDataPacket[], FieldPacket[]] =
          await connection.execute("SELECT id FROM tags WHERE name = ?", [
            trimmedTagName,
          ]);

        let tagId: number;

        if (tagRows.length === 0) {
          const [tagResult]: [any, any] = await connection.execute(
            "INSERT INTO tags (name) VALUES (?)",
            [trimmedTagName]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }

        await connection.execute(
          "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
          [id, tagId]
        );
      }

      // Commit the transaction
      await connection.commit();
    } catch (tagError) {
      // Rollback transaction if tag update fails
      await connection.rollback();
      throw tagError;
    }

    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Function to delete a product and its associated images and categories
// Function to delete a product and its associated images and categories
export async function handleDelete(req: NextRequest, id: string) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // First, retrieve the category and image IDs associated with the product
    const [relatedData]: [any[], any] = await connection.execute(
      "SELECT category_id FROM product WHERE id = ?",
      [id]
    );

    if (relatedData.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { category_id } = relatedData[0];

    // Delete associated product-tag relations
    await connection.execute("DELETE FROM product_tags WHERE product_id = ?", [
      id,
    ]);

    // Delete the product
    await connection.execute("DELETE FROM product WHERE id = ?", [id]);

    // Check if there are any other products in the same category
    const [remainingProducts]: [any[], any] = await connection.execute(
      "SELECT id FROM product WHERE category_id = ?",
      [category_id]
    );

    if (remainingProducts.length === 0) {
      // If no other products in the category, delete the category
      await connection.execute("DELETE FROM categories WHERE id = ?", [
        category_id,
      ]);
    }

    // No need to delete tags, as they remain in the database and could be associated with other products

    // Delete associated images if they are not used by any other products
    const [usedImages]: [any[], any] = await connection.execute(
      "SELECT id FROM product WHERE image_id = ?",
      [id]
    );

    if (usedImages.length === 0) {
      await connection.execute("DELETE FROM images WHERE id = ?", [id]);
    }

    await connection.commit();
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function handleCategoryPut(req: NextRequest, id: string) {
  const connection = await getConnection();

  try {
    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());
    const { name } = fields;

    // Update category details using parameterized query
    await connection.execute("UPDATE categories SET name = ? WHERE id = ?", [
      name,
      id,
    ]);

    // Handle file uploads if any (add your logic here)

    await connection.commit();
    return NextResponse.json(
      { message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function handleCategoryDelete(req: NextRequest, name: string) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Check if the category exists
    const [categoryRows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] =
      await connection.execute(
        "SELECT id FROM categories WHERE name = ? FOR UPDATE",
        [name]
      );

    if (categoryRows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryId = categoryRows[0].id;

    // Check if there are products in the category
    const [products]: [mysql.RowDataPacket[], mysql.FieldPacket[]] =
      await connection.execute("SELECT id FROM product WHERE category_id = ?", [
        categoryId,
      ]);

    if (products.length > 0) {
      // Cannot delete the category if it has products
      return NextResponse.json(
        { error: "Cannot delete category with products" },
        { status: 400 }
      );
    }

    // Delete the category
    await connection.execute("DELETE FROM categories WHERE id = ?", [
      categoryId,
    ]);

    await connection.commit();
    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function signUp(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const connection = await getConnection();

  const validatedFields = signUpSchema.safeParse({
    first_name: formData.get("first_name")?.toString() ?? "",
    last_name: formData.get("last_name")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    password1: formData.get("password1")?.toString() ?? "",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { first_name, last_name, role, email, password } = validatedFields.data;

  try {
    await connection.beginTransaction();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'User') DEFAULT 'User',
        is_verified BOOLEAN DEFAULT FALSE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    const [existingUserRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUserRows.length > 0) {
      await connection.rollback();
      return {
        errors: { email: ["Email is already in use."] },
      };
    }

    const [adminCountResult]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT COUNT(*) as adminCount FROM users WHERE role = 'Admin'"
      );
    const adminCount = adminCountResult[0].adminCount;

    if (role === "Admin" && adminCount >= 2) {
      await connection.rollback();
      return { errors: { role: ["Maximum admin accounts reached."] } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        `INSERT INTO users (first_name, last_name, role, email, password) VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, role, email, hashedPassword]
      );

    const userId = (userResult as any).insertId;

    const sessionToken = await createSession(userId.toString());

    await sendVerificationEmail(email, sessionToken);

    await connection.commit();

    return {
      success: true,
      message:
        "User signed up successfully. A verification email has been sent.",
      userId,
    };
  } catch (error: any) {
    await connection.rollback();
    console.error("Sign-up error:", error);
    return {
      errors: {
        server: ["An error occurred while signing up. Please try again."],
      },
    };
  } finally {
    connection.release();
  }
}

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const connection = await getConnection();

  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const errorMessage = { errors: { server: ["Invalid login credentials."] } };
  const userNotFoundError = { errors: { server: ["User not found."] } };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const email = validatedFields.data.email;

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, email, password, is_verified FROM users WHERE email = ?`,
      [email]
    );

    const user = rows[0];

    if (!user) {
      return userNotFoundError;
    }

    if (!user.is_verified) {
      return {
        errors: { server: ["Please verify your email before logging in."] },
      };
    }

    const passwordMatch = await bcrypt.compare(
      validatedFields.data.password,
      user.password
    );

    if (!passwordMatch) {
      return errorMessage;
    }

    const userId = user.id.toString();
    const sessionToken = await createSession(userId);

    return {
      success: true,
      message: "Login successful!",
      sessionToken,
    };
  } catch (error) {
    return { errors: { server: ["An error occurred during login."] } };
  } finally {
    connection.release();
  }
}

export async function logout() {
  deleteSession();
}
