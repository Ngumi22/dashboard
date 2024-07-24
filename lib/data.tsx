import { getConnection } from "./db";
import { mapProductRow, sanitizeInput } from "./utils";
import { NextRequest, NextResponse } from "next/server";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { Product, ProductRow, ProductFilter, UserRow } from "./definitions";
import { getCache, setCache } from "./cache";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ITEMS_PER_PAGE = 10;
const DISCOUNTED_ITEMS_PER_PAGE = 5;
const cache = new Map<string, any>();

export async function searchProducts(
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

  const cacheKey = `search_products_${JSON.stringify(filter)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const connection = await getConnection();

  try {
    let queryParams: any[] = [];
    let queryConditions: string[] = [];

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
        ${
          queryConditions.length > 0
            ? " AND " + queryConditions.join(" AND ")
            : ""
        }
      ORDER BY p.id ASC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
    const products = (rows as ProductRow[]).map(mapProductRow);

    setCache(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error(`Failed to fetch products`);
  } finally {
    connection.release();
  }
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
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const connection = await getConnection();

  try {
    let queryParams: any[] = [];
    let queryConditions: string[] = [];

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
        ${
          queryConditions.length > 0
            ? " AND " + queryConditions.join(" AND ")
            : ""
        }
      ORDER BY p.id ASC LIMIT ? OFFSET ?
    `;

    queryParams.push(ITEMS_PER_PAGE, offset);

    const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
    const products = (rows as ProductRow[]).map(mapProductRow);

    if (products.length === 0) {
      return []; // Return an empty array if no products match the criteria
    }

    setCache(cacheKey, products);
    return products;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
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
      WHERE c.name = ?
    `,
      [name]
    );

    if (rows.length === 0) {
      return [];
    }

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
      [`%${sanitizeInput(name)}%`]
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
      [`%${sanitizeInput(brand)}%`]
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
      WHERE p.status LIKE ?
    `,
      [`%${sanitizeInput(status)}%`]
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
      WHERE p.price BETWEEN ? AND ?
      ORDER BY p.id ASC
    `;

    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      query,
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

export async function fetchProductsByDiscountRangeFromDb(
  minDiscount: number,
  maxDiscount: number,
  currentPage: number
): Promise<Product[]> {
  const cacheKey = `products_discount_${minDiscount}_${maxDiscount}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  const offset = (currentPage - 1) * DISCOUNTED_ITEMS_PER_PAGE;
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
      WHERE p.discount BETWEEN ? AND ?
      ORDER BY p.id ASC LIMIT ${sanitizeInput(
        DISCOUNTED_ITEMS_PER_PAGE
      )} OFFSET ${sanitizeInput(offset)}
    `;

    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      query,
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

export async function fetchBrandsFromDb(): Promise<string[]> {
  const cacheKey = `brands`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const connection = await getConnection();
  try {
    const query = `SELECT DISTINCT brand FROM product WHERE brand IS NOT NULL`;

    const [rows] = await connection.execute(query);
    const brands = (rows as ProductRow[]).map(
      (row: { brand: string }) => row.brand
    );

    cache.set(cacheKey, brands);
    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchUsers() {
  const connection = await getConnection();

  try {
    const [rows]: [any[], any] = await connection.query(
      "SELECT id, username, email, role FROM users"
    );

    return { success: true, users: rows };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, message: "Server error" };
  } finally {
    connection.release();
  }
}

export async function fetchUserById(userId: string) {
  const connection = await getConnection();

  try {
    const [rows]: [any[], any] = await connection.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    return { success: true, user: rows[0] };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, message: "Server error" };
  } finally {
    connection.release();
  }
}

export async function authenticateUser(email: string, password: string) {
  const connection = await getConnection();
  try {
    const [users]: [any[], any] = await connection.query(
      "SELECT id, username, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log("No user found with the provided email");
      return { success: false, message: "Invalid credentials" };
    }

    const user = users[0];
    console.log("User found:", user);

    // Check password
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);

    if (!match) {
      return { success: false, message: "Invalid credentials" };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return { success: true, token };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: "Server error" };
  } finally {
    connection.release();
  }
}
