import { getConnection } from "./db";
import { mapProductRow } from "./utils";
import { NextResponse } from "next/server";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { Product, ProductRow, ProductFilter } from "./definitions";

const cache = new Map<string, any>();

const ITEMS_PER_PAGE = 10;

function sanitizeInput(input: string | number): string | number {
  if (typeof input === "string") {
    return input.replace(/'/g, "\\'"); // Escape single quotes
  }
  return input;
}

export async function fetchFilteredProductsFromDb(
  currentPage: number,
  filter: ProductFilter
): Promise<Product[]> {
  const {
    minPrice,
    maxPrice,
    minDiscount,
    maxDiscount,
    name,
    brand,
    category,
    status,
  } = filter;
  const cacheKey = `filtered_products_${currentPage}_${JSON.stringify(filter)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const connection = await getConnection();
  try {
    let query = `
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
      WHERE 1 = 1
    `;

    const params: (string | number)[] = [];

    if (minPrice !== undefined && maxPrice !== undefined) {
      query += " AND p.price BETWEEN &{minPrice} AND &{maxPrice}";
    }

    if (minDiscount !== undefined && maxDiscount !== undefined) {
      query += " AND p.discount BETWEEN ? AND ?";
      params.push(minDiscount, maxDiscount);
    }

    if (name) {
      query += " AND p.name LIKE ?";
      params.push(`%${sanitizeInput(name)}%`);
    }

    if (brand) {
      query += " AND p.brand LIKE ?";
      params.push(`%${sanitizeInput(brand)}%`);
    }

    if (category) {
      query += " AND c.name = ?";
      params.push(sanitizeInput(category));
    }

    if (status) {
      query += " AND p.status = ?";
      params.push(sanitizeInput(status));
    }

    query += " ORDER BY p.id ASC LIMIT ? OFFSET ?";
    params.push(ITEMS_PER_PAGE, offset);

    console.log("Query:", query); // Log the query for debugging
    console.log("Params:", params); // Log the params for debugging

    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      query,
      params
    );
    const products = (rows as ProductRow[]).map(mapProductRow);

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchAllProductsFromDb(
  currentPage: number
): Promise<Product[]> {
  const cacheKey = `all_products_${currentPage}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const connection = await getConnection();
  try {
    const query = `
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
      ORDER BY p.id ASC
      LIMIT ${sanitizeInput(ITEMS_PER_PAGE)} OFFSET ${sanitizeInput(offset)}
    `;

    const [rows] = await connection.execute(query);
    const products = (rows as ProductRow[]).map(mapProductRow);

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductByIdFromDb(
  id: string
): Promise<NextResponse> {
  const cacheKey = `product_${id}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { status: 200 });
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const product = mapProductRow(rows[0] as ProductRow);

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

export async function fetchCategoryByIdFromDb(
  id: string
): Promise<NextResponse> {
  const cacheKey = `category_${id}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { status: 200 });
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, name FROM categories WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const category = { id: rows[0].id, name: rows[0].name };

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

export async function fetchProductsByCategoryFromDb(
  name: string
): Promise<Product[]> {
  const cacheKey = `products_category_${name}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const products = (rows as ProductRow[]).map(mapProductRow);

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductsByNameFromDb(
  name: string
): Promise<Product[]> {
  const cacheKey = `products_name_${name}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const products = (rows as ProductRow[]).map(mapProductRow);

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by name:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductsByBrandFromDb(
  brand: string
): Promise<Product[]> {
  const cacheKey = `products_brand_${brand}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const products = (rows as ProductRow[]).map(mapProductRow);

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
): Promise<Product[]> {
  const cacheKey = `products_price_${minPrice}_${maxPrice}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const products = (rows as ProductRow[]).map(mapProductRow);

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
): Promise<Product[]> {
  const cacheKey = `products_discount_${minDiscount}_${maxDiscount}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const products = (rows as ProductRow[]).map(mapProductRow);

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by discount range:", error);
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}

export async function fetchProductsByStatusFromDb(
  status: string
): Promise<Product[]> {
  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
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

    const products = (rows as ProductRow[]).map(mapProductRow);

    return products;
  } catch (error) {
    throw new Error("Failed to fetch products");
  } finally {
    connection.release();
  }
}
