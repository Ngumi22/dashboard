"use server";

import mysql from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { FileData } from "@/lib/definitions";
import {
  validateFiles,
  convertToBase64,
  formatCurrency,
  formatDateToLocal,
} from "./utils";

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
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    // Check image size
    const checkImageSize = (file: File) => file.size <= 100 * 1024; // 100KB
    if (
      !checkImageSize(main_image) ||
      !checkImageSize(thumbnail1) ||
      !checkImageSize(thumbnail2) ||
      !checkImageSize(thumbnail3) ||
      !checkImageSize(thumbnail4) ||
      !checkImageSize(thumbnail5)
    ) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: "Images must be less than 100KB." },
        { status: 400 }
      );
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
      "INSERT INTO product (sku, name, description, category_id, status, image_id, price, discount, quantity, brand,createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
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
        brand,
      ]
    );

    await connection.commit();

    const response = NextResponse.json(
      { success: true, message: "Product added successfully" },
      { status: 200 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error: any) {
    await connection.rollback();
    console.error(error);
    const response = NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
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
        p.createdAt,
        p.updatedAt,
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
        price: formatCurrency(row.price * 100), // Format to KSH
        discount: row.discount,
        quantity: row.quantity,
        createdAt: formatDateToLocal(row.createdAt),
        updatedAt: formatDateToLocal(row.updatedAt),
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
        p.createdAt,
        p.updatedAt,
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
      price: formatCurrency(row.price * 100), // Format to KSH
      discount: row.discount,
      quantity: row.quantity,
      createdAt: formatDateToLocal(row.createdAt),
      updatedAt: formatDateToLocal(row.updatedAt),
      images: {
        main: convertToBase64(row.main_image),
        thumbnails,
      },
    };

    return NextResponse.json(product, { status: 200 });
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

export async function handlePut(req: NextRequest, id: string) {
  const connection = await getConnection();

  try {
    const formData = await req.formData();
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
      "UPDATE product SET sku = ?, name = ?, description = ?, category_id = ?, status = ?, price = ?, discount = ?, quantity = ? WHERE id = ?",
      [
        sku,
        name,
        description,
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

// Function to delete a product and its associated images and categories
export async function handleDelete(req: NextRequest, id: string) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Delete the product
    await connection.execute("DELETE FROM product WHERE id = ?", [id]);

    // Delete associated images
    await connection.execute(
      "DELETE FROM images WHERE id IN (SELECT image_id FROM product WHERE id = ?)",
      [id]
    );

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

export async function fetchCategoryByIdFromDb(id: string) {
  const connection = await getConnection();
  try {
    const [rows]: any[] = await connection.execute(
      `SELECT * FROM categories WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const row = rows[0];

    const category = {
      id: row.id,
      name: row.name, // Ensure to include necessary fields
    };

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  } finally {
    connection.end();
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
    console.error("Error updating category:", error);
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  } finally {
    connection.end();
  }
}

export async function handleCategoryDelete(req: NextRequest, id: string) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Delete the category
    await connection.execute("DELETE FROM categories WHERE id = ?", [id]);

    // Delete associated products
    await connection.execute("DELETE FROM products WHERE category_id = ?", [
      id,
    ]);

    await connection.commit();
    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    await connection.rollback();
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  } finally {
    connection.end();
  }
}
