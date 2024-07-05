// Import necessary modules and types
import { getConnection } from "./db";
import { mapProductRow } from "./utils";
import { NextResponse } from "next/server";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { Product, ProductRow, ProductFilter } from "./definitions";
import { getCache, setCache } from "./cache";

// Constants
const ITEMS_PER_PAGE = 10;
const cache = new Map<string, any>();

// Utility function to sanitize input
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

  // Construct cache key based on currentPage and filter
  const cacheKey = `filtered_products_${currentPage}_${JSON.stringify(filter)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const connection = await getConnection();

  try {
    let queryParams: any[] = [];
    let queryConditions: string[] = [];

    // Building the WHERE clause dynamically based on provided filters
    if (minPrice !== undefined) {
      queryConditions.push("p.price >= ?");
      queryParams.push(minPrice);
    }
    if (maxPrice !== undefined) {
      queryConditions.push("p.price <= ?");
      queryParams.push(maxPrice);
    }
    if (minDiscount !== undefined) {
      queryConditions.push("p.discount >= ?");
      queryParams.push(minDiscount);
    }
    if (maxDiscount !== undefined) {
      queryConditions.push("p.discount <= ?");
      queryParams.push(maxDiscount);
    }
    if (name) {
      queryConditions.push("p.name LIKE ?");
      queryParams.push(`%${name}%`);
    }
    if (brand) {
      queryConditions.push("p.brand = ?");
      queryParams.push(brand);
    }
    if (category) {
      queryConditions.push("c.name = ?");
      queryParams.push(category);
    }
    if (status !== undefined) {
      queryConditions.push("p.status = ?");
      queryParams.push(status);
    }

    // Construct the SQL query
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
      WHERE 1=1
        ${queryConditions.length > 0 ? queryConditions.join(" AND ") : ""}
      ORDER BY p.id ASC LIMIT ? OFFSET ?
    `;

    // Add pagination parameters to the query parameters array
    queryParams.push(ITEMS_PER_PAGE, offset);

    // Execute the query with parameters
    const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
    const products = (rows as ProductRow[]).map(mapProductRow);

    // Cache the fetched products
    setCache(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Function to fetch all products from the database
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

// Function to fetch a product by ID from the database
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

// Function to fetch a category by ID from the database
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

// Function to fetch products by category from the database
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

// Function to fetch products by name from the database
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

// Function to fetch products by brand from the database
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
      WHERE p.brand = ?
    `,
      [brand]
    );

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

// Function to fetch products by price range from the database
export async function fetchProductsByPriceRangeFromDb(
  minPrice: number,
  maxPrice: number
): Promise<Product[]> {
  const cacheKey = `products_price_range_${minPrice}_${maxPrice}`;
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
    throw error;
  } finally {
    connection.release();
  }
}

// Function to fetch products by discount range from the database
export async function fetchProductsByDiscountRangeFromDb(
  minDiscount: number,
  maxDiscount: number
): Promise<Product[]> {
  const cacheKey = `products_discount_range_${minDiscount}_${maxDiscount}`;
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
    throw error;
  } finally {
    connection.release();
  }
}

// Function to fetch products by status from the database
export async function fetchProductsByStatusFromDb(
  status: string
): Promise<Product[]> {
  const cacheKey = `products_status_${status}`;
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
      WHERE p.status = ?
    `,
      [status]
    );

    const products = (rows as ProductRow[]).map(mapProductRow);

    cache.set(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching products by status:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Function to fetch brands from the database
export async function fetchBrandsFromDb(): Promise<NextResponse> {
  const cacheKey = "brands";
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { status: 200 });
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT DISTINCT brand FROM product WHERE brand IS NOT NULL`
    );

    const brands = rows.map((row) => row.brand);

    cache.set(cacheKey, brands);
    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Function to fetch categories from the database
export async function fetchCategoriesFromDb(): Promise<NextResponse> {
  const cacheKey = "categories";
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey), { status: 200 });
  }

  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, name FROM categories`
    );

    const categories = rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));

    cache.set(cacheKey, categories);
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
