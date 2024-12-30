"use server";

import { RowDataPacket } from "mysql2/promise";
import { getCache, setCache } from "@/lib/cache";
import { DBQUERYLIMITS } from "@/lib/Constants";
import sharp from "sharp";
import { getErrorMessage } from "@/lib/utils";
import { getConnection } from "@/lib/MysqlDB/initDb";
import {
  mapProductRow,
  Product,
  ProductRow,
  SearchParams,
} from "./productTypes";

// Compress image utility
async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    const compressedBuffer = await sharp(buffer)
      .resize(100) // Resize to 100px width
      .webp({ quality: 70 }) // Convert to WebP with 70% quality
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error:", error);
    return null;
  }
}
export async function fetchFilteredProductsFromDb(
  currentPage: number,
  filter: SearchParams
): Promise<{ products: Product[]; errorMessage?: string }> {
  const cacheKey = `filtered_products_${currentPage}_${JSON.stringify(filter)}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const limit =
    DBQUERYLIMITS[filter.type as keyof typeof DBQUERYLIMITS] ||
    DBQUERYLIMITS.default;
  const offset = (currentPage - 1) * limit;

  const connection = await getConnection();

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
          MAX(pi.main_image) AS mainImage,
          MAX(pi.thumbnail_image1) AS thumbnail1,
          MAX(pi.thumbnail_image2) AS thumbnail2,
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
    const [rows] = await connection.query<ProductRow[]>(query, queryParams);
    const products = await Promise.all(rows.map(mapProductRow));

    const result = { products };
    setCache(cacheKey, result, { ttl: 300 });
    return result;
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    throw error;
  } finally {
    connection.release();
  }
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
