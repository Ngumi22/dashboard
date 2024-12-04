"use server";

import { RowDataPacket } from "mysql2/promise";
import { getCache, setCache } from "@/lib/cache";
import { getConnection } from "@/lib/database";
import { mapProductRow, Product, ProductRow, SearchParams } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

export const LIMITS = {
  brand: 5,
  category: 5,
  default: 10,
};

export async function fetchFilteredProductsFromDb(
  currentPage: number,
  filter: SearchParams
) {
  const cacheKey = `filtered_products_${currentPage}_${JSON.stringify(filter)}`;

  // Check cache first
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  // Validate currentPage
  if (currentPage <= 0) {
    return { products: [], errorMessage: "Invalid page number" };
  }

  const limit = LIMITS[filter.type as keyof typeof LIMITS] || LIMITS.default;
  const offset = (currentPage - 1) * limit;

  const connection = await getConnection();

  try {
    const queryConditions: string[] = [];
    const queryParams: (string | number)[] = [];

    // Dynamic filtering conditions
    if (filter.minPrice)
      queryConditions.push("p.product_price >= ?"),
        queryParams.push(filter.minPrice);
    if (filter.maxPrice)
      queryConditions.push("p.product_price <= ?"),
        queryParams.push(filter.maxPrice);
    if (filter.name)
      queryConditions.push("p.product_name LIKE ?"),
        queryParams.push(`%${filter.name}%`);
    if (filter.brand)
      queryConditions.push("b.brand_name = ?"), queryParams.push(filter.brand);
    if (filter.category)
      queryConditions.push("c.category_name = ?"),
        queryParams.push(filter.category);

    const whereClause = queryConditions.length
      ? queryConditions.join(" AND ")
      : "1=1";

    const query = `
      SELECT
        p.product_id,
        p.product_name AS name,
        p.product_price AS price,
        p.product_discount AS discount,
        p.product_quantity AS quantity,
        c.category_name AS category,
        b.brand_name AS brand,
        p.product_status AS status,
        COALESCE(GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ','), '') AS tags
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE ${whereClause}
      GROUP BY p.product_id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?;
    `;

    queryParams.push(limit, offset);

    const [rows] = await connection.query<ProductRow[]>(query, queryParams);

    const products = rows.map(mapProductRow);

    // Cache the result
    const result = { products };
    setCache(cacheKey, result, { ttl: 300 }); // Cache for 5 minutes

    return result;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return { products: [], errorMessage: "Failed to fetch products" };
  } finally {
    connection.release();
  }
}

export async function fetchProductByIdFromDb(product_id: string) {
  const cacheKey = `product:${product_id}`;

  // Validate product_id
  if (!product_id) throw new Error("Invalid product ID");

  // Check cache
  const cachedProduct = getCache(cacheKey);
  if (cachedProduct) return cachedProduct as Product;

  const connection = await getConnection();

  try {
    const query = `
      SELECT
        p.product_id,
        p.product_name AS name,
        p.product_price AS price,
        p.product_discount AS discount,
        p.product_quantity AS quantity,
        c.category_name AS category,
        b.brand_name AS brand,
        p.product_status AS status,
        COALESCE(GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ','), '') AS tags
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.product_id = ?
      GROUP BY p.product_id;
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query, [product_id]);

    if (rows.length === 0) return null;

    const product = mapProductRow(rows[0] as ProductRow);

    // Cache the result
    setCache(cacheKey, product, { ttl: 300 });

    return product;
  } catch (error) {
    const errorMessage = getErrorMessage(error, "fetchProductById");
    console.error(errorMessage); // This will log both the message and stack trace (on the server)
    // Pass errorMessage to client or show in UI
  } finally {
    connection.release();
  }
}

export async function getUniqueBrands() {
  const connection = await getConnection();
  try {
    const [brands] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT b.brand_name, b.brand_image FROM brands b`);
    const uniqueBrands = brands.map((brand) => brand.brand_name);
    const result = { uniqueBrands };
    return result;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUniqueTags() {
  const connection = await getConnection();
  try {
    const [tags] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT t.tag_name FROM tags t JOIN product_tags pt ON t.tag_id = pt.tag_id`);
    const uniqueTags = tags.map((tag) => tag.tag_name);
    const result = { uniqueTags };
    return result;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUniqueSuppliers() {
  const connection = await getConnection();
  try {
    const [supplier] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT
        s.supplier_id,
        s.supplier_name,
        s.supplier_email,
        s.supplier_phone_number,
        s.supplier_location
        FROM suppliers s
        JOIN product_suppliers ps
        ON s.supplier_id = ps.supplier_id`);
    const result = { supplier };
    return result;
  } catch (error) {
    console.error("Error fetching filtered suppliers:", error);
    throw error;
  } finally {
    connection.release();
  }
}
