import { getConnection } from "./db";
import { mapProductRow, mapUserRow, sanitizeInput } from "./utils";
import { NextRequest, NextResponse } from "next/server";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import {
  Product,
  ProductRow,
  SearchParams,
  UserRow,
  User,
} from "./definitions";
import { getCache, setCache } from "./cache";

const ITEMS_PER_PAGE = 10;
const DISCOUNTED_ITEMS_PER_PAGE = 5;
const cache = new Map<string, any>();

export async function fetchFilteredProductsFromDb(
  currentPage: number,
  filter: SearchParams
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
    return cachedData.products; // Return only the products array
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
        i.thumbnail5,
        COALESCE(GROUP_CONCAT(t.name SEPARATOR ','), '') AS tags
      FROM product p
      LEFT JOIN images i ON p.image_id = i.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_tags pt ON p.id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE 1=1
        ${
          queryConditions.length > 0
            ? " AND " + queryConditions.join(" AND ")
            : ""
        }
      GROUP BY p.id
      ORDER BY p.id ASC LIMIT ? OFFSET ?
    `;

    queryParams.push(ITEMS_PER_PAGE, offset);

    const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
    const products = (rows as ProductRow[]).map(mapProductRow);

    if (products.length === 0) {
      return []; // Return an empty array if no products match the criteria
    }

    // Fetch unique tags, categories, and brands
    const [tags] = await connection.query<RowDataPacket[]>(
      "SELECT DISTINCT t.name FROM tags t JOIN product_tags pt ON t.id = pt.tag_id"
    );
    const uniqueTags = tags.map((tag: RowDataPacket) => tag.name);

    const [categories] = await connection.query<RowDataPacket[]>(
      "SELECT DISTINCT c.name FROM categories c"
    );
    const uniqueCategories = categories.map(
      (category: RowDataPacket) => category.name
    );

    const [brands] = await connection.query<RowDataPacket[]>(
      "SELECT DISTINCT p.brand FROM product p"
    );
    const uniqueBrands = brands.map((brand: RowDataPacket) => brand.brand);

    const result = {
      products,
      uniqueTags,
      uniqueCategories,
      uniqueBrands,
    };

    setCache(cacheKey, result, { ttl: 300 }); // Example with 5 minutes TTL
    return result.products; // Return only the products array
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchProductByIdFromDb(
  productId: string
): Promise<Product | null> {
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
          i.thumbnail5,
          COALESCE(GROUP_CONCAT(t.name SEPARATOR ','), '') AS tags
        FROM product p
        LEFT JOIN images i ON p.image_id = i.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_tags pt ON p.id = pt.product_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = ?
        GROUP BY p.id;
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query, [productId]);

    if (rows.length === 0) {
      return null; // No product found
    }

    const product = mapProductRow(rows[0] as ProductRow);

    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
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

export async function fetchUniqueBrands(): Promise<string[]> {
  const connection = await getConnection();
  try {
    const [rows]: [any[], any[]] = await connection.execute(`
      SELECT DISTINCT p.brand
      FROM product p
    `);
    return rows.map((row) => row.brand);
  } catch (error) {
    console.error("Error fetching unique brands:", error);
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

export async function fetchUsers(): Promise<User[]> {
  const connection = await getConnection();

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT * FROM users`
    );

    // Map each row to a User object
    const users = (rows as UserRow[]).map(mapUserRow);

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchUserByEmail(email: string): Promise<UserRow[]> {
  const connection = await getConnection();

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, first_name, last_name, email, password FROM users WHERE email = ?`,
      [email]
    );
    return rows as UserRow[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  } finally {
    connection.release();
  }
}
export async function getUserById(userId: any) {
  const connection = await getConnection();
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Error fetching user by Id:", error);
    throw error;
  } finally {
    connection.release();
  }
}
