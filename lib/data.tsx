import mysql, { FieldPacket, RowDataPacket } from "mysql2/promise";
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
}

export async function getConnection() {
  if (!pool) await initDbConnection();
  return pool.getConnection();
}

async function indexExists(
  connection: mysql.PoolConnection,
  tableName: string,
  indexName: string
): Promise<boolean> {
  const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
    `
    SELECT COUNT(1) as count
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
    AND table_name = ?
    AND index_name = ?;
  `,
    [tableName, indexName]
  );

  return rows[0].count > 0;
}

export async function indexDatabase() {
  const connection = await getConnection();
  try {
    const indexes = [
      { table: "product", name: "idx_product_id", column: "id" },
      {
        table: "product",
        name: "idx_product_category_id",
        column: "category_id",
      },
      { table: "product", name: "idx_product_name", column: "name" },
      { table: "product", name: "idx_product_sku", column: "sku" },
      { table: "categories", name: "idx_category_name", column: "name" },
      { table: "images", name: "idx_images_id", column: "id" },
    ];

    for (const { table, name, column } of indexes) {
      const exists = await indexExists(connection, table, name);
      if (!exists) {
        await connection.execute(
          `CREATE INDEX ${name} ON ${table}(${column});`
        );
      }
    }

    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  } finally {
    connection.release();
  }
}

indexDatabase().catch((err) => {
  console.error("Failed to index the database:", err);
});

const cache = new Map<string, any>();

export async function fetchAllProductFromDb(): Promise<any[]> {
  const cacheKey = "all_products";
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

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

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductByIdFromDb(id: string) {
  const cacheKey = `product_${id}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { status: 200 });
  }

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

    cache.set(cacheKey, product);
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
  const cacheKey = `category_${id}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { status: 200 });
  }

  const connection = await getConnection();
  try {
    const [rows]: any[] = await connection.execute(
      `SELECT id, name FROM categories WHERE id = ?`,
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

    cache.set(cacheKey, category);
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
  const cacheKey = `products_category_${name}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

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

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductsByNameFromDb(name: string) {
  const cacheKey = `products_name_${name}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [any[], any] = await connection.execute(
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
      WHERE p.name LIKE ?
    `,
      [`%${name}%`]
    );

    if (rows.length === 0) {
      console.log(`No products found with name like: ${name}`);
      throw new Error("Product not found");
    }

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

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by name:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductsByBrandFromDb(brand: string) {
  const cacheKey = `products_brand_${brand}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [any[], any] = await connection.execute(
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
      WHERE p.brand LIKE ?
    `,
      [`%${brand}%`]
    );

    if (rows.length === 0) {
      console.log(`No products found with brand like: ${brand}`);
      throw new Error("Product not found");
    }

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

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductsByPriceRangeFromDb(
  minPrice: number,
  maxPrice: number
) {
  const cacheKey = `products_price_${minPrice}_${maxPrice}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [any[], any] = await connection.execute(
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
      WHERE p.price BETWEEN ? AND ?
    `,
      [minPrice, maxPrice]
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

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by price range:", error);
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByDiscountRangeFromDb(
  minDiscount: number,
  maxDiscount: number
) {
  const cacheKey = `products_discount_${minDiscount}_${maxDiscount}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

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
      WHERE p.discount BETWEEN ? AND ?
    `,
      [minDiscount, maxDiscount]
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

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by discount range:", error);
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
