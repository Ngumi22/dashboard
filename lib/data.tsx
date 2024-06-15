"use server";

import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { convertToBase64, formatDateToLocal } from "./utils";

// Initialize database connection pool
let pool: mysql.Pool;

export async function initDbConnection() {
  if (!pool) {
    pool = mysql.createPool({
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
  return pool;
}

export async function getConnection() {
  if (!pool) initDbConnection();
  return pool.getConnection();
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
        p.brand,
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
        brand: row.brand,
        price: row.price, // Format to KSH
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
        p.brand,
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
      brand: row.brand,
      price: row.price,
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
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  } finally {
    connection.release();
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
    const category = { id: row.id, name: row.name };

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function fetchProductsByCategoryFromDb(name: string) {
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
        p.brand,
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
      WHERE c.name = ?
    `,
      [name]
    );

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
        brand: row.brand,
        price: row.price,
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
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByNameFromDb(name: string) {
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
        p.brand,
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
      WHERE p.name = ?
    `,
      [name]
    );

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
        brand: row.brand,
        price: row.price,
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
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByBrandFromDb(brand: string) {
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
        p.brand,
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
      WHERE p.brand = ?
    `,
      [brand]
    );

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
        brand: row.brand,
        price: row.price,
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
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByPriceFromDb(price: number) {
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
        p.brand,
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
      WHERE p.price = ?
    `,
      [price]
    );

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
        brand: row.brand,
        price: row.price,
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
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByDiscountFromDb(discount: number) {
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
        p.brand,
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
      WHERE p.discount = ?
    `,
      [discount]
    );

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
        brand: row.brand,
        price: row.price,
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
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByStatusFromDb(status: string) {
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
        p.brand,
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
      WHERE p.status = ?
    `,
      [status]
    );

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
        brand: row.brand,
        price: row.price,
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
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}
