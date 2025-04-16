"use server";

import { DBQUERYLIMITS } from "@/lib/Constants";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { Product, SearchParams } from "./search-params";
import { compressAndEncodeBase64 } from "../../utils";

export async function getFilteredProducts(
  filter: SearchParams
): Promise<Product[]> {
  const limit = Number(filter.perPage) || DBQUERYLIMITS.default;
  const offset = ((filter.page ?? 1) - 1) * limit;
  const sortClause = getSortClause(filter.sort || "newest");

  return dbOperation(async (connection) => {
    try {
      // Fetch all categories for potential filtering
      const [allCategories] = await connection.query(`
        WITH RECURSIVE subcategories AS (
          SELECT category_id, category_name, parent_category_id
          FROM categories
          WHERE parent_category_id IS NULL AND category_status = 'active'
          UNION ALL
          SELECT c.category_id, c.category_name, c.parent_category_id
          FROM categories c
          INNER JOIN subcategories s ON c.parent_category_id = s.category_id
        )
        SELECT category_id AS id, category_name AS name
        FROM subcategories
      `);

      // Determine category IDs from filter
      let categoryIds: string[] = [];
      if (filter.category) {
        const selectedCategories = Array.isArray(filter.category)
          ? filter.category
          : [filter.category];

        categoryIds = allCategories
          .filter((cat: any) => selectedCategories.includes(cat.name))
          .map((cat: any) => cat.id);
      }

      // Build WHERE clause and parameters
      const { whereClause, queryParams } = buildFilterConditions(
        filter,
        categoryIds
      );

      // Main product query
      const query = `
        SELECT
          p.product_id AS id,
          p.product_name AS name,
          p.product_sku AS sku,
          p.product_price AS price,
          p.product_discount AS discount,
          p.product_quantity AS quantity,
          p.product_status AS status,
          p.product_description AS description,
          p.long_description,
          p.category_id,
          c.category_name,
          DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
          b.brand_name,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          MAX(pi.main_image) AS main_image,
          COALESCE(GROUP_CONCAT(DISTINCT CONCAT(spec.specification_id, ':', spec.specification_name, ':', ps.value, ':', p.category_id) ORDER BY spec.specification_name SEPARATOR '|'), '') AS specifications
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN product_images pi ON p.product_id = pi.product_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN product_specifications ps ON p.product_id = ps.product_id
        LEFT JOIN specifications spec ON ps.specification_id = spec.specification_id
        LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
        WHERE ${whereClause}
        GROUP BY p.product_id
        ORDER BY ${sortClause}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const [rows] = await connection.query(query, queryParams);

      return await mapRowsToProducts(rows);
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    } finally {
      connection.release();
    }
  });
}

async function mapRowsToProducts(rows: any[]): Promise<Product[]> {
  return Promise.all(
    rows.map(async (row): Promise<Product> => {
      const compressedMainImage = await compressAndEncodeBase64(
        row.main_image || null
      );

      const specifications = row.specifications
        ? row.specifications.split("|").map((spec: string) => {
            const [
              specification_id,
              specification_name,
              specification_value,
              category_id,
            ] = spec.split(":");
            return {
              specification_id,
              specification_name,
              specification_value,
              category_id,
            };
          })
        : [];

      console.log("Serv status", row.status);

      return {
        id: parseInt(row.id),
        sku: row.sku,
        name: row.name,
        description: row.description,
        long_description: row.long_description,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        discount: parseFloat(row.discount),
        main_image: compressedMainImage ?? "",
        brand_name: row.brand_name,
        category_name: row.category_name,
        specifications,
        ratings: row.ratings,
        status: row.status,
      };
    })
  );
}

function buildFilterConditions(filter: SearchParams, categoryIds: string[]) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter.name) {
    conditions.push("p.product_name LIKE ?");
    params.push(`%${filter.name}%`);
  }
  if (filter.minPrice) {
    conditions.push("p.product_price >= ?");
    params.push(filter.minPrice);
  }
  if (filter.maxPrice) {
    conditions.push("p.product_price <= ?");
    params.push(filter.maxPrice);
  }
  if (filter.minDiscount) {
    conditions.push("p.product_discount >= ?");
    params.push(filter.minDiscount);
  }
  if (filter.maxDiscount) {
    conditions.push("p.product_discount <= ?");
    params.push(filter.maxDiscount);
  }
  if (filter.brand) {
    if (Array.isArray(filter.brand)) {
      conditions.push(
        `b.brand_name IN (${filter.brand.map(() => "?").join(", ")})`
      );
      params.push(...filter.brand);
    } else {
      conditions.push("b.brand_name = ?");
      params.push(filter.brand);
    }
  }
  if (filter.category && categoryIds.length > 0) {
    conditions.push(
      `p.category_id IN (${categoryIds.map(() => "?").join(", ")})`
    );
    params.push(...categoryIds);
  }
  if (filter.quantity) {
    conditions.push("p.product_quantity >= ?");
    params.push(filter.quantity);
  }
  if (filter.minRating) {
    conditions.push("COALESCE(ROUND(AVG(pr.rating), 1), 0) >= ?");
    params.push(filter.minRating);
  }
  if (filter.maxRating) {
    conditions.push("COALESCE(ROUND(AVG(pr.rating), 1), 0) <= ?");
    params.push(filter.maxRating);
  }

  Object.entries(filter)
    .filter(([key]) => key.startsWith("spec_"))
    .forEach(([key, value]) => {
      const specName = key.replace("spec_", "");
      const specValues = Array.isArray(value) ? value : [value];
      specValues.forEach((val) => {
        conditions.push(`
          EXISTS (
            SELECT 1
            FROM product_specifications ps
            INNER JOIN specifications spec
              ON ps.specification_id = spec.specification_id
            WHERE ps.product_id = p.product_id
              AND LOWER(spec.specification_name) = ?
              AND LOWER(ps.value) = ?
          )
        `);
        params.push(specName.toLowerCase(), String(val).toLowerCase());
      });
    });

  return {
    whereClause: conditions.length ? conditions.join(" AND ") : "1=1",
    queryParams: params,
  };
}

function getSortClause(sort: string): string {
  switch (sort) {
    case "price-low-high":
      return "p.product_price ASC";
    case "price-high-low":
      return "p.product_price DESC";
    case "rating":
      return "ratings DESC";
    case "discount":
      return "p.product_discount DESC";
    case "oldest":
      return "p.created_at ASC";
    case "newest":
    default:
      return "p.created_at DESC";
  }
}
