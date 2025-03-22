"use server";

import { cache } from "@/lib/cache";
import { DBQUERYLIMITS } from "@/lib/Constants";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { Product, SearchParams } from "./search-params";
import { compressAndEncodeBase64 } from "../utils";

export async function fetchProductsAndFilters(filter: SearchParams): Promise<{
  products: Product[];
  totalProducts: number;
  totalPages: number;
  filters: {
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    specifications: { id: string; name: string; values: string[] }[];
    minPrice: number;
    maxPrice: number;
  };
  errorMessage?: string;
}> {
  const limit = Number(filter.perPage) || DBQUERYLIMITS.default;
  const offset = ((filter.page ?? 1) - 1) * limit;
  const cacheKey = `products_${filter.page}_${limit}_${offset}_${
    filter.sort
  }_${JSON.stringify(filter)}`;

  const sortClause = getSortClause(filter.sort || "newest");

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value;
    }
    cache.delete(cacheKey);
  }

  return dbOperation(async (connection) => {
    try {
      // Fetch all parent categories and their subcategories
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

      // If a category filter is provided, extract the relevant category IDs (including subcategories)
      let categoryIds: string[] = [];
      if (filter.category) {
        const selectedCategories = Array.isArray(filter.category)
          ? filter.category
          : [filter.category];

        // Map selected categories to their IDs (including subcategories)
        categoryIds = allCategories
          .filter((cat: any) => selectedCategories.includes(cat.name))
          .map((cat: any) => cat.id);
      }

      // Build filter conditions
      const { whereClause, queryParams } = buildFilterConditions(
        filter,
        categoryIds
      );

      // Fetch total number of products
      const [totalProductsResult] = await connection.query(
        `SELECT COUNT(DISTINCT p.product_id) AS totalProducts
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         LEFT JOIN product_images pi ON p.product_id = pi.product_id
         LEFT JOIN brands b ON p.brand_id = b.brand_id
         LEFT JOIN product_tags pt ON p.product_id = pt.product_id
         LEFT JOIN tags t ON pt.tag_id = t.tag_id
         LEFT JOIN product_specifications ps ON p.product_id = ps.product_id
         LEFT JOIN specifications spec ON ps.specification_id = spec.specification_id
         LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
         WHERE ${whereClause}`,
        queryParams
      );

      const totalProducts = totalProductsResult[0]?.totalProducts || 0;
      const totalPages = Math.ceil(totalProducts / limit);

      // Fetch paginated products with sorting
      const query = `
        SELECT
            p.product_id AS id,
            p.product_name AS name,
            p.product_sku AS sku,
            p.product_price AS price,
            p.product_discount AS discount,
            p.product_quantity AS quantity,
            p.product_description AS description,
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
        LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      const [rows] = await connection.query(query, queryParams);

      // Fetch filter options
      const [brands] = await connection.query(`
        SELECT b.brand_id AS id, b.brand_name AS name
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.brand_id
        GROUP BY b.brand_id, b.brand_name
      `);

      const [specifications] = await connection.query(`
        SELECT
            cs.category_id,
            s.specification_id,
            s.specification_name,
            JSON_ARRAYAGG(ps.value) AS specification_values
        FROM
            category_specifications cs
        JOIN
            specifications s ON cs.specification_id = s.specification_id
        JOIN
            product_specifications ps ON s.specification_id = ps.specification_id
        GROUP BY
            cs.category_id, s.specification_id, s.specification_name;
      `);

      const [priceRange] = await connection.query(`
        SELECT MIN(product_price) AS minPrice, MAX(product_price) AS maxPrice
        FROM products
      `);

      const products: Product[] = await mapRowsToProducts(rows);

      const transformedSpecifications = specifications.map((spec: any) => ({
        id: spec.specification_id.toString(),
        name: spec.specification_name,
        values: spec.specification_values,
      }));

      const result = {
        products,
        totalProducts,
        totalPages,
        filters: {
          categories: allCategories, // Include all categories (parent and subcategories)
          brands,
          specifications: transformedSpecifications,
          minPrice: priceRange[0]?.minPrice || 0,
          maxPrice: priceRange[0]?.maxPrice || 0,
        },
      };

      // console.log("Final SQL Query:", query);

      // console.log("Sort parameter:", filter.sort);
      // Cache result
      cache.set(cacheKey, {
        value: result,
        expiry: Date.now() + 3600 * 10, // Cache for 10 hours
      });

      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        filters: {
          categories: [],
          brands: [],
          specifications: [],
          minPrice: 0,
          maxPrice: 0,
        },
        errorMessage: "Unable to load products.",
      };
    } finally {
      connection.release();
    }
  });
}
// Helper function to map DB rows to Product objects
async function mapRowsToProducts(rows: any[]): Promise<Product[]> {
  return Promise.all(
    rows.map(async (row): Promise<Product> => {
      const compressedMainImage: string =
        (await compressAndEncodeBase64(row.main_image || null)) ?? "";

      const specifications: {
        specification_id: string;
        specification_name: string;
        specification_value: string;
        category_id: string;
      }[] = row.specifications
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

      return {
        id: parseInt(row.id),
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        discount: parseFloat(row.discount),
        main_image: compressedMainImage || "",
        brand_name: row.brand_name,
        category_name: row.category_name,
        specifications,
        ratings: row.ratings,
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

  // Handle spec_ prefixed parameters
  Object.entries(filter)
    .filter(([key]) => key.startsWith("spec_"))
    .forEach(([key, value]) => {
      if (value) {
        const specName = key.replace("spec_", ""); // Extract the specification name
        const specValues = Array.isArray(value) ? value : [value];
        specValues.forEach((specValue) => {
          conditions.push(
            `EXISTS (
              SELECT 1
              FROM product_specifications ps
              INNER JOIN specifications spec
                ON ps.specification_id = spec.specification_id
              WHERE ps.product_id = p.product_id
                AND LOWER(spec.specification_name) = ?
                AND LOWER(ps.value) = ?
            )`
          );
          params.push(specName.toLowerCase(), String(specValue).toLowerCase());
        });
      }
    });

  const whereClause =
    conditions.length > 0
      ? conditions.join(" AND ")
      : filter.name
      ? "p.product_name LIKE ?"
      : "1";
  if (!conditions.length && filter.name) {
    params.push(`%${filter.name}%`);
  }

  return { whereClause, queryParams: params };
}

function getSortClause(sort?: string) {
  switch (sort) {
    case "price-asc":
      return "p.product_price ASC";
    case "price-desc":
      return "p.product_price DESC";
    case "name-asc":
      return "p.product_name ASC";
    case "name-desc":
      return "p.product_name DESC";
    case "popularity":
      return "ratings DESC"; // Assuming 'ratings' imply popularity
    case "newest":
    default:
      return "p.created_at DESC";
  }
}
