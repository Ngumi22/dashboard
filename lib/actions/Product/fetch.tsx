"use server";

import { cache } from "@/lib/cache";
import { DBQUERYLIMITS } from "@/lib/Constants";
import {
  mapProductRow,
  Product,
  ProductRow,
  SearchParams,
} from "./productTypes";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function fetchProducts(
  currentPage: number,
  filter: SearchParams
): Promise<{ products: Product[]; errorMessage?: string }> {
  const cacheKey = `products_${currentPage}_${JSON.stringify(filter)}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const limit =
    DBQUERYLIMITS[filter.type as keyof typeof DBQUERYLIMITS] ||
    DBQUERYLIMITS.default;
  const offset = (currentPage - 1) * limit;

  return dbOperation(async (connection) => {
    try {
      const { whereClause, queryParams } = buildFilterConditions(filter);
      const query = `
      SELECT
          p.product_id,
          p.product_name AS name,
          p.product_sku AS sku,
          p.product_price AS price,
          p.product_discount AS discount,
          p.product_quantity AS quantity,
          c.category_name AS category,
          p.product_status AS status,
          p.product_description AS description,
          b.brand_name AS brand,
          GROUP_CONCAT(DISTINCT s.supplier_name ORDER BY s.supplier_name SEPARATOR ', ') AS suppliers,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          p.created_at AS createdAt,
          p.updated_at AS updatedAt,
          MAX(pi.main_image) AS main_image,
          MAX(pi.thumbnail_image1) AS thumbnail1,
          MAX(pi.thumbnail_image2) AS thumbnail2,
          MAX(pi.thumbnail_image3) AS thumbnail3,
          MAX(pi.thumbnail_image4) AS thumbnail4,
          MAX(pi.thumbnail_image5) AS thumbnail5,
          COALESCE(GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ','), '') AS tags
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      INNER JOIN categories c ON p.category_id = c.category_id
      INNER JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN product_suppliers ps ON p.product_id = ps.product_id
      LEFT JOIN suppliers s ON ps.supplier_id = s.supplier_id
      LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE ${whereClause}
      GROUP BY p.product_id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?`;

      queryParams.push(limit, offset);
      const [rows] = await connection.query(query, queryParams);
      const products = await Promise.all(rows.map(mapProductRow));

      const result = { products };

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: result,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });
      return result;
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      return { products: [], errorMessage: "Unable to load products." };
    } finally {
      connection.release();
    }
  });
}

// Helper to build WHERE clause dynamically
function buildFilterConditions(filter: SearchParams) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter.minPrice)
    conditions.push("p.product_price >= ?"), params.push(filter.minPrice);
  if (filter.maxPrice)
    conditions.push("p.product_price <= ?"), params.push(filter.maxPrice);
  if (filter.minDiscount)
    conditions.push("p.product_discount >= ?"), params.push(filter.minDiscount);
  if (filter.maxDiscount)
    conditions.push("p.product_discount <= ?"), params.push(filter.maxDiscount);
  if (filter.name)
    conditions.push("p.product_name LIKE ?"), params.push(`%${filter.name}%`);
  if (filter.brand)
    conditions.push("b.brand_name = ?"), params.push(filter.brand);
  if (filter.category)
    conditions.push("c.category_name = ?"), params.push(filter.category);
  if (filter.status !== undefined)
    conditions.push("p.product_status = ?"), params.push(filter.status);
  if (filter.stock)
    conditions.push("p.product_quantity >= ?"), params.push(filter.stock);
  if (filter.minRating) {
    conditions.push("COALESCE(ROUND(AVG(pr.rating), 1), 0) >= ?");
    params.push(filter.minRating);
  }
  if (filter.maxRating) {
    conditions.push("COALESCE(ROUND(AVG(pr.rating), 1), 0) <= ?");
    params.push(filter.maxRating);
  }

  if (filter.tags) {
    const tags = filter.tags.split(",");
    conditions.push(`(${tags.map(() => "t.tag_name = ?").join(" OR ")})`);
    params.push(...tags);
  }

  // Default condition to ensure valid SQL even if no filters exist
  if (conditions.length === 0) {
    conditions.push("1 = 1");
  }

  return { whereClause: conditions.join(" AND "), queryParams: params };
}

export async function fetchProductByIdFromDb(
  product_id: string
): Promise<Product | null> {
  const cacheKey = `product_${product_id}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Product;
    }
    cache.delete(cacheKey);
  }

  return dbOperation(async (connection) => {
    try {
      const query = `
      SELECT
          p.product_id,
          p.product_name AS name,
          p.product_sku AS sku,
          p.product_price AS price,
          p.product_discount AS discount,
          p.product_quantity AS quantity,
          c.category_name AS category,
          p.product_status AS status,
          p.product_description AS description,
          b.brand_name AS brand,
          GROUP_CONCAT(DISTINCT s.supplier_name ORDER BY s.supplier_name SEPARATOR ', ') AS suppliers,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          p.created_at AS createdAt,
          p.updated_at AS updatedAt,
          MAX(pi.main_image) AS main_image,
          MAX(pi.thumbnail_image1) AS thumbnail1,
          MAX(pi.thumbnail_image2) AS thumbnail2,
          MAX(pi.thumbnail_image3) AS thumbnail3,
          MAX(pi.thumbnail_image4) AS thumbnail4,
          MAX(pi.thumbnail_image5) AS thumbnail5,
          COALESCE(GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ','), '') AS tags
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      INNER JOIN categories c ON p.category_id = c.category_id
      INNER JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN product_suppliers ps ON p.product_id = ps.product_id
      LEFT JOIN suppliers s ON ps.supplier_id = s.supplier_id
      LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.product_id = ?;
    `;

      const [rows] = await connection.query(query, [product_id]);

      if (rows.length === 0) return null;

      const product = mapProductRow(rows[0] as ProductRow);

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: product,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });
      return product;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw error;
    } finally {
      connection.release();
    }
  });
}

export async function fetchProductByName(productName: string) {
  const cacheKey = `${productName}`;

  // Check cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Product[];
    }
    cache.delete(cacheKey);
  }
  return dbOperation(async (connection) => {
    try {
      const result = await connection.query(
        `SELECT * FROM products
          WHERE LOWER(product_name) = LOWER(${productName})`
      );

      if (result.rows.length === 0) {
        return null; // No product found
      }
      // Cache the result
      cache.set(cacheKey, {
        value: result.rows,
        expiry: Date.now() + 3600 * 10, // 10 hours
      });
      return result.rows[0]; // Return the first matching product
    } catch (error) {
      console.error("Error fetching product name:", error);
      throw error;
    }
  });
}
