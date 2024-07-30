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

export async function handlePost(request: NextRequest) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Ensure tables exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        main_image MEDIUMBLOB,
        thumbnail1 MEDIUMBLOB,
        thumbnail2 MEDIUMBLOB,
        thumbnail3 MEDIUMBLOB,
        thumbnail4 MEDIUMBLOB,
        thumbnail5 MEDIUMBLOB
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        status ENUM('Archived', 'Active', 'Draft') DEFAULT 'Draft',
        image_id INT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        discount INT NOT NULL DEFAULT 0,
        brand VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (image_id) REFERENCES images(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

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
      return NextResponse.json(
        {
          success: false,
          message: "Price, discount, and quantity cannot be less than zero",
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
      const response = NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
      return response;
    }

    // Check image size and type
    const checkImage = (file: File) =>
      file.size <= 100 * 1024 &&
      ["image/jpeg", "image/png"].includes(file.type);
    if (
      !checkImage(main_image) ||
      !checkImage(thumbnail1) ||
      !checkImage(thumbnail2) ||
      !checkImage(thumbnail3) ||
      !checkImage(thumbnail4) ||
      !checkImage(thumbnail5)
    ) {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: "Images must be less than 100KB and in JPEG or PNG format.",
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

    // Check if a product with the same sku already exists
    const [existingProducts]: [any[], any] = await connection.query(
      "SELECT id FROM product WHERE sku = ? FOR UPDATE",
      [sku]
    );

    if (existingProducts.length > 0) {
      await connection.rollback();
      const response = NextResponse.json(
        { success: false, message: "Product with this SKU already exists" },
        { status: 400 }
      );
      return response;
    }

    // Check if the category exists, if not, insert it
    let [categoryRows]: [any[], any] = await connection.query(
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
    } else {
      categoryId = categoryRows[0].id;
    }

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

    const productQuery = `
      INSERT INTO product (sku, name, description, category_id, status, image_id, price, discount, brand, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(productQuery, [
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

    await connection.commit();

    // Revalidate the necessary paths
    revalidatePath("/dashboard/products");
    // Redirect to the product detail page
    redirect(`/dashboard/products`);
  } catch (error: any) {
    await connection.rollback();
    const response = NextResponse.json({
      success: false,
      message: error.message,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } finally {
    connection.release();
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

    // Handle file uploads
    // Separate logic for updating images

    await connection.commit();
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
export async function handleDelete(req: NextRequest, id: string) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // First, retrieve the category and image IDs associated with the product
    const [relatedData]: [any[], any] = await connection.execute(
      "SELECT category_id, image_id FROM product WHERE id = ?",
      [id]
    );

    if (relatedData.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { category_id, image_id } = relatedData[0];

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

    // Delete associated images if they are not used by any other products
    const [usedImages]: [any[], any] = await connection.execute(
      "SELECT id FROM product WHERE image_id = ?",
      [image_id]
    );

    if (usedImages.length === 0) {
      await connection.execute("DELETE FROM images WHERE id = ?", [image_id]);
    }

    await connection.commit();
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
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

  // Validate form fields
  const validatedFields = signUpSchema.safeParse({
    first_name: formData.get("first_name")?.toString() ?? "",
    last_name: formData.get("last_name")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    password1: formData.get("password1")?.toString() ?? "",
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { first_name, last_name, role, email, password } = validatedFields.data;

  try {
    await connection.beginTransaction();

    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'User') DEFAULT 'User'
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

    // Check if the user's email already exists
    const [existingUserRows]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUserRows.length > 0) {
      await connection.rollback();
      return {
        errors: { email: ["Email is already in use."] },
      };
    }

    // Check the number of admin users
    const [adminCountResult]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT COUNT(*) as adminCount FROM users WHERE role = 'Admin'"
      );
    const adminCount = adminCountResult[0].adminCount;

    if (role === "Admin" && adminCount >= 2) {
      await connection.rollback();
      return { errors: { role: ["Maximum admin accounts reached."] } };
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const [userResult]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        `INSERT INTO users (first_name, last_name, role, email, password) VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, role, email, hashedPassword]
      );

    const userId = (userResult as any).insertId;

    // Create a session for the user
    const sessionToken = await createSession(userId.toString());
    await connection.query(
      `INSERT INTO sessions (user_id, session_token) VALUES (?, ?)`,
      [userId, sessionToken]
    );

    await connection.commit();

    return {
      success: true,
      message: "User signed up successfully.",
      userId,
      sessionToken,
    };
  } catch (error: any) {
    await connection.rollback();
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

  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const errorMessage = { errors: { server: ["Invalid login credentials."] } };
  const userNotFoundError = { errors: { server: ["User not found."] } };

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const email = validatedFields.data.email;

  try {
    // 2. Query the database for the user with the given email
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, email, password FROM users WHERE email = ?`,
      [email]
    );

    const user = rows[0]; // Extract the first row from the result

    // If user is not found, return early
    if (!user) {
      return userNotFoundError;
    }

    // 3. Compare the user's password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(
      validatedFields.data.password,
      user.password
    );

    // If the password does not match, return early
    if (!passwordMatch) {
      return errorMessage;
    }

    // 4. If login is successful, create a session for the user
    const userId = user.id.toString();
    const sessionToken = await createSession(userId);

    // Return success message with session token or any other relevant data
    return {
      success: true,
      message: "Login successful!",
      sessionToken,
    };
  } catch (error) {
    return { errors: { server: ["An error occurred during login."] } };
  } finally {
    connection.release(); // Ensure the connection is released
  }
}

export async function logout() {
  deleteSession();
}
