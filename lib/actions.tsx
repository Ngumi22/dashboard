"use server";

import mysql from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { FileData, ProductssData, ImageData } from "@/lib/definitions";
import { validateFiles } from "./utils";
import { convertToBase64 } from "./utils";

// Database connection
export async function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: 3306,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// POST function
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
        main_image LONGBLOB,
        thumbnail1 LONGBLOB,
        thumbnail2 LONGBLOB,
        thumbnail3 LONGBLOB,
        thumbnail4 LONGBLOB,
        thumbnail5 LONGBLOB
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
        discount DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        quantity INT NOT NULL DEFAULT 0,
        FOREIGN KEY (image_id) REFERENCES images(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());

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
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    // Input validation to prevent SQL injection and other vulnerabilities
    const sanitizeInput = (input: string) => input.replace(/['"]/g, "");
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
        price: parseFloat(fields.price as string),
        discount: parseFloat(fields.discount as string),
        quantity: parseInt(fields.quantity as string, 10),
      },
    };

    const {
      sku,
      name,
      description,
      category,
      status,
      price,
      discount,
      quantity,
    } = fileData.fields;

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
      response.headers.set("Cache-Control", "no-store");
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

    // Insert product with associated image_id and category_id
    await connection.query(
      "INSERT INTO product (sku, name, description, category_id, status, image_id, price, discount, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        sku,
        name,
        description,
        categoryId,
        status,
        imageId,
        price,
        discount,
        quantity,
      ]
    );

    await connection.commit();

    const response = NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
    });
    response.headers.set(
      "Cache-Control",
      "s-maxage=10, stale-while-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Database error:", error);
    await connection.rollback();
    const response = NextResponse.json({
      success: false,
      message: "Database error",
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } finally {
    await connection.end();
  }
}

export async function fetchAllProductFromDb(): Promise<any[]> {
  const connection = await getConnection();
  try {
    const [rows]: any[] = await connection.execute(`
      SELECT
        p.id AS product_id,
        p.name,
        p.sku,
        p.price,
        p.discount,
        p.quantity,
        c.name AS category,
        p.status,
        p.description,
        i.main_image,
        i.thumbnail1,
        i.thumbnail2,
        i.thumbnail3,
        i.thumbnail4,
        i.thumbnail5
      FROM product p
      LEFT JOIN images i ON p.image_id = i.id
      LEFT JOIN categories c ON p.category_id = c.id
    `);

    const products = rows.map((row: any) => {
      const thumbnails = [
        row.thumbnail1,
        row.thumbnail2,
        row.thumbnail3,
        row.thumbnail4,
        row.thumbnail5,
      ]
        .filter(Boolean)
        .map(convertToBase64);

      return {
        id: row.product_id,
        sku: row.sku,
        status: row.status,
        category: row.category,
        name: row.name,
        description: row.description,
        price: row.price,
        discount: row.discount,
        quantity: row.quantity,
        images: {
          main: convertToBase64(row.main_image),
          thumbnails,
        },
      };
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function fetchProductByIdFromDb(id: string) {
  const connection = await getConnection();
  try {
    const [rows]: any[] = await connection.execute(
      `
      SELECT
        p.id AS product_id,
        p.name,
        p.sku,
        p.price,
        p.discount,
        p.quantity,
        c.name AS category,
        p.status,
        p.description,
        i.main_image,
        i.thumbnail1,
        i.thumbnail2,
        i.thumbnail3,
        i.thumbnail4,
        i.thumbnail5
      FROM product p
      LEFT JOIN images i ON p.image_id = i.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const row = rows[0];
    const thumbnails = [
      row.thumbnail1,
      row.thumbnail2,
      row.thumbnail3,
      row.thumbnail4,
      row.thumbnail5,
    ]
      .filter(Boolean)
      .map(convertToBase64);

    const product = {
      id: row.product_id,
      sku: row.sku,
      status: row.status,
      category: row.category,
      name: row.name,
      description: row.description,
      price: row.price,
      discount: row.discount,
      quantity: row.quantity,
      images: {
        main: convertToBase64(row.main_image),
        thumbnails,
      },
    };

    // Ensure that the product is a plain object
    return NextResponse.json(JSON.parse(JSON.stringify(product)), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  } finally {
    connection.end();
  }
}

// Function to update a product
export async function handlePut(request: NextRequest, id: string) {
  const connection = await getConnection();
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const {
      sku,
      name,
      description,
      category,
      status,
      price,
      discount,
      quantity,
    } = fields;

    await connection.beginTransaction();

    // Update product details
    await connection.execute(
      "UPDATE product SET sku = ?, name = ?, description = ?, category_id = ?, status = ?, price = ?, discount = ?, quantity = ? WHERE id = ?",
      [sku, name, description, category, status, price, discount, quantity, id]
    );

    // Handle file uploads
    const main_image = formData.get("main_image") as File | null;
    const thumbnail1 = formData.get("thumbnail1") as File | null;
    const thumbnail2 = formData.get("thumbnail2") as File | null;
    const thumbnail3 = formData.get("thumbnail3") as File | null;
    const thumbnail4 = formData.get("thumbnail4") as File | null;
    const thumbnail5 = formData.get("thumbnail5") as File | null;

    if (
      main_image ||
      thumbnail1 ||
      thumbnail2 ||
      thumbnail3 ||
      thumbnail4 ||
      thumbnail5
    ) {
      const mainImageBuffer = main_image
        ? Buffer.from(await main_image.arrayBuffer())
        : null;
      const thumbnailBuffers = [
        thumbnail1 ? Buffer.from(await thumbnail1.arrayBuffer()) : null,
        thumbnail2 ? Buffer.from(await thumbnail2.arrayBuffer()) : null,
        thumbnail3 ? Buffer.from(await thumbnail3.arrayBuffer()) : null,
        thumbnail4 ? Buffer.from(await thumbnail4.arrayBuffer()) : null,
        thumbnail5 ? Buffer.from(await thumbnail5.arrayBuffer()) : null,
      ];

      await connection.execute(
        "UPDATE images SET main_image = ?, thumbnail1 = ?, thumbnail2 = ?, thumbnail3 = ?, thumbnail4 = ?, thumbnail5 = ? WHERE id = (SELECT image_id FROM product WHERE id = ?)",
        [mainImageBuffer, ...thumbnailBuffers, id]
      );
    }

    await connection.commit();
    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  } finally {
    connection.end();
  }
}

// Function to delete a product
export async function handleDelete(request: NextRequest, id: string) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Delete associated images
    await connection.execute(
      "DELETE FROM images WHERE id = (SELECT image_id FROM product WHERE id = ?)",
      [id]
    );

    // Delete the product
    await connection.execute("DELETE FROM product WHERE id = ?", [id]);

    await connection.commit();
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    connection.end();
  }
}
