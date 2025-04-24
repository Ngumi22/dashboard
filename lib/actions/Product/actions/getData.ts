"use server";

import { DBQUERYLIMITS } from "@/lib/Constants";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../../utils";
import { Product, SearchParams } from "./search-params";
import { unstable_cache as nextCache } from "next/cache";

const MAX_QUERY_LIMIT = 100;
const CACHE_TTL = 60 * 60 * 0.1; // 2 hours in seconds

export type ProductFetchResult = {
  products: Product[];
  filters: {
    categories: {
      id: string;
      name: string;
      image: string;
      parentId: string | null;
    }[];
    brands: { id: string; name: string }[];
    specifications: { id: string; name: string; values: string[] }[];
    priceRange: { min: number; max: number };
    tags: string[];
  };
  pagination: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  error?: string;
};

export const fetchProducts = nextCache(
  async (filter: SearchParams): Promise<ProductFetchResult> => {
    try {
      const validatedFilter = validateAndNormalizeFilter(filter);
      const { limit, offset } = calculatePagination(validatedFilter);

      return await dbOperation(async (connection) => {
        // Execute all database queries in parallel
        const [
          categories,
          brands,
          priceRange,
          specifications,
          tags,
          totalProducts,
          products,
        ] = await Promise.all([
          fetchCategories(connection),
          fetchBrands(connection),
          fetchPriceRange(connection),
          fetchSpecifications(connection),
          fetchTags(connection),
          fetchTotalProducts(connection, validatedFilter),
          fetchPaginatedProducts(connection, validatedFilter, limit, offset),
        ]);

        // Process product images in parallel
        const processedProducts = await Promise.all(
          products.map(async (product: Product) => mapProduct(product))
        );

        return {
          products: processedProducts,
          filters: {
            categories: await processCategories(categories),
            brands,
            specifications: transformSpecifications(specifications),
            priceRange,
            tags,
          },
          pagination: {
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: validatedFilter.page || 1,
            perPage: limit,
          },
        };
      });
    } catch (error) {
      console.error("Product fetch error:", error);
      return getErrorResponse(
        filter,
        error instanceof Error ? error.message : "Failed to load products"
      );
    }
  },
  ["products-fetch"],
  { revalidate: CACHE_TTL, tags: ["products"] }
);

// Helper Functions
function validateAndNormalizeFilter(filter: SearchParams): SearchParams {
  return {
    ...filter,
    page: Math.max(1, filter.page || 1),
    perPage: Math.min(
      Math.max(1, filter.perPage || DBQUERYLIMITS.default),
      MAX_QUERY_LIMIT
    ),
    name: filter.name?.trim(),
    category: normalizeFilterValue(filter.category),
    brand: normalizeFilterValue(filter.brand),
    tag: normalizeFilterValue(
      typeof filter.tag === "string" || Array.isArray(filter.tag)
        ? filter.tag
        : undefined
    ),
  };
}

function normalizeFilterValue(
  value: string | string[] | undefined
): string | string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter((v) => v);
  return value.trim();
}

function calculatePagination(filter: SearchParams) {
  const limit = filter.perPage || DBQUERYLIMITS.default;
  const offset = ((filter.page || 1) - 1) * limit;
  return { limit, offset };
}

function generateCacheKey(filter: SearchParams): string {
  const { page, perPage, ...rest } = filter;
  return JSON.stringify(rest);
}

function getErrorResponse(
  filter: SearchParams,
  errorMessage: string
): ProductFetchResult {
  return {
    products: [],
    filters: {
      categories: [],
      brands: [],
      specifications: [],
      priceRange: { min: 0, max: 0 },
      tags: [],
    },
    pagination: {
      totalProducts: 0,
      totalPages: 0,
      currentPage: filter.page || 1,
      perPage: filter.perPage || DBQUERYLIMITS.default,
    },
    error: errorMessage,
  };
}

// Data Processing Functions
async function processCategories(categories: any[]) {
  return Promise.all(
    categories.map(async (category) => ({
      ...category,
      image: category.image
        ? await compressAndEncodeBase64(category.image)
        : "",
    }))
  );
}

function transformSpecifications(specs: any[]) {
  return specs.map((spec) => ({
    id: spec.id,
    name: spec.name,
    values: spec.spec_values || [], // Map spec_values to values
  }));
}

async function mapProduct(product: any): Promise<Product> {
  const mainImage = product.main_image
    ? await compressAndEncodeBase64(product.main_image)
    : "";

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    long_description: product.long_description,
    sku: product.sku,
    status: product.status,
    price: product.price,
    quantity: product.quantity,
    discount: product.discount,
    main_image: mainImage || "",
    ratings: product.ratings,
    category_id: product.category_id,
    category_name: product.category_name,
    brand_name: product.brand_name,
    brand_id: product.brand_id,
    tags: product.tags ? product.tags.split(",") : [],
    specifications: product.specifications
      ? product.specifications.split("||").map((spec: string) => {
          const [name, value] = spec.split("::");
          return {
            specification_id: "",
            specification_name: name,
            specification_value: value,
            category_id: product.category_id,
          };
        })
      : [],
    created_at: product.created_at,
  };
}

// Database Query Functions
async function fetchCategories(connection: any) {
  const [categories] = await connection.query(`
    SELECT
      category_id AS id,
      category_name AS name,
      category_image AS image,
      parent_category_id AS parentId
    FROM categories
    ORDER BY category_name
  `);
  return categories;
}

async function fetchBrands(connection: any) {
  const [brands] = await connection.query(`
    SELECT DISTINCT b.brand_id AS id, b.brand_name AS name
    FROM brands b
    JOIN products p ON p.brand_id = b.brand_id
    WHERE p.product_status = 'approved'
  `);
  return brands;
}

async function fetchPriceRange(connection: any) {
  const [[result]] = await connection.query(`
    SELECT
      COALESCE(MIN(product_price), 0) AS min,
      COALESCE(MAX(product_price), 1000) AS max
    FROM products
    WHERE product_status = 'approved'
  `);
  return {
    min: Number(result.min) || 0,
    max: Number(result.max) || 1000,
  };
}

async function fetchSpecifications(connection: any) {
  const [specs] = await connection.query(`
    SELECT
        s.specification_id AS id,
        s.specification_name AS name,
        JSON_ARRAYAGG(ps_distinct.value) AS spec_values
    FROM specifications s
    JOIN (
        SELECT DISTINCT specification_id, value
        FROM product_specifications
      ) ps_distinct ON s.specification_id = ps_distinct.specification_id
    GROUP BY s.specification_id, s.specification_name;
  `);
  return specs.map((spec: any) => ({
    ...spec,
    values: spec.values ? JSON.parse(spec.values) : [],
  }));
}

async function fetchTags(connection: any) {
  const [tags] = await connection.query(`
    SELECT DISTINCT t.tag_name
    FROM tags t
    JOIN product_tags pt ON t.tag_id = pt.tag_id
    JOIN products p ON pt.product_id = p.product_id
    WHERE p.product_status = 'approved'
  `);
  return tags.map((t: any) => t.tag_name);
}

async function fetchTotalProducts(connection: any, filter: SearchParams) {
  const categoryIds = await getCategoryIds(connection, filter.category);
  const { whereClause, queryParams } = buildFilterConditions(
    filter,
    categoryIds
  );

  const [[{ count }]] = await connection.query(
    `SELECT COUNT(DISTINCT p.product_id) AS count
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.category_id
     LEFT JOIN brands b ON p.brand_id = b.brand_id
     WHERE ${whereClause}`,
    queryParams
  );

  return count || 0;
}

async function fetchPaginatedProducts(
  connection: any,
  filter: SearchParams,
  limit: number,
  offset: number
) {
  const categoryIds = await getCategoryIds(connection, filter.category);
  const { whereClause, queryParams } = buildFilterConditions(
    filter,
    categoryIds
  );
  const sortClause = getSortClause(filter.sort);

  const [products] = await connection.query(
    `SELECT
      p.product_id AS id,
      p.product_sku AS sku,
      p.product_name AS name,
      p.product_price AS price,
      p.product_discount AS discount,
      p.product_quantity AS quantity,
      p.product_description AS description,
      p.product_status AS status,
      p.category_id,
      p.brand_id,
      c.category_name,
      b.brand_name,
      COALESCE(pr.avg_rating, 0) AS ratings,
      pi.main_image,
      pt.tags,
      ps.specifications,
      p.created_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN brands b ON p.brand_id = b.brand_id
    LEFT JOIN (
      SELECT product_id, AVG(rating) AS avg_rating
      FROM product_reviews
      GROUP BY product_id
    ) pr ON p.product_id = pr.product_id
    LEFT JOIN (
      SELECT product_id, MAX(main_image) AS main_image
      FROM product_images
      GROUP BY product_id
    ) pi ON p.product_id = pi.product_id
    LEFT JOIN (
      SELECT
        pt.product_id,
        GROUP_CONCAT(DISTINCT t.tag_name) AS tags
      FROM product_tags pt
      JOIN tags t ON pt.tag_id = t.tag_id
      GROUP BY pt.product_id
    ) pt ON p.product_id = pt.product_id
    LEFT JOIN (
      SELECT
        ps.product_id,
        GROUP_CONCAT(DISTINCT
          CONCAT(s.specification_name, '::', ps.value)
          SEPARATOR '||') AS specifications
      FROM product_specifications ps
      JOIN specifications s ON ps.specification_id = s.specification_id
      GROUP BY ps.product_id
    ) ps ON p.product_id = ps.product_id
    WHERE ${whereClause}
    GROUP BY p.product_id
    ORDER BY ${sortClause}
    LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return products;
}

async function getCategoryIds(
  connection: any,
  categoryFilter?: string | string[]
) {
  if (!categoryFilter) return [];

  const categories = Array.isArray(categoryFilter)
    ? categoryFilter
    : [categoryFilter];

  const [results] = await connection.query(
    `WITH RECURSIVE CategoryTree AS (
      SELECT category_id FROM categories
      WHERE category_name IN (?)
      UNION ALL
      SELECT c.category_id FROM categories c
      JOIN CategoryTree ct ON c.parent_category_id = ct.category_id
    )
    SELECT category_id FROM CategoryTree`,
    [categories]
  );

  return results.map((r: any) => r.category_id);
}

function buildFilterConditions(filter: SearchParams, categoryIds: string[]) {
  const conditions: string[] = ["p.product_status = 'approved'"];
  const params: (string | number)[] = [];

  if (filter.name) {
    conditions.push("(p.product_name LIKE ? OR p.product_description LIKE ?)");
    params.push(`%${filter.name}%`, `%${filter.name}%`);
  }

  if (filter.minPrice) {
    conditions.push("p.product_price >= ?");
    params.push(filter.minPrice);
  }
  if (filter.maxPrice) {
    conditions.push("p.product_price <= ?");
    params.push(filter.maxPrice);
  }

  if (categoryIds.length > 0) {
    conditions.push(
      `p.category_id IN (${categoryIds.map(() => "?").join(",")})`
    );
    params.push(...categoryIds);
  }

  if (filter.brand) {
    if (Array.isArray(filter.brand)) {
      conditions.push(
        `b.brand_name IN (${filter.brand.map(() => "?").join(",")})`
      );
      params.push(...filter.brand);
    } else {
      conditions.push("b.brand_name = ?");
      params.push(filter.brand);
    }
  }

  if (filter.tag) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM product_tags pt
        JOIN tags t ON pt.tag_id = t.tag_id
        WHERE pt.product_id = p.product_id
        AND t.tag_name ${Array.isArray(filter.tag) ? `IN (${filter.tag.map(() => "?").join(",")})` : "= ?"}
      )
    `);
    Array.isArray(filter.tag)
      ? params.push(...filter.tag)
      : typeof filter.tag === "string" || typeof filter.tag === "number"
        ? params.push(filter.tag)
        : null;
  }

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

  return {
    whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1=1",
    queryParams: params,
  };
}

function getSortClause(sort?: string): string {
  switch (sort) {
    case "price-asc":
      return "p.product_price ASC, p.product_name ASC";
    case "price-desc":
      return "p.product_price DESC, p.product_name ASC";
    case "name-asc":
      return "p.product_name ASC";
    case "name-desc":
      return "p.product_name DESC";
    case "popularity":
      return "ratings DESC";
    case "newest":
    default:
      return "p.created_at DESC";
  }
}
