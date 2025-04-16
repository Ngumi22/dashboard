"use server";

import { DBQUERYLIMITS } from "@/lib/Constants";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../../utils";
import { Product, ProductStatus, SearchParams } from "./search-params";

type ProductFetchResult = [
  Product[], // Array of complete Product objects
  {
    filters: {
      categories: { id: string; name: string }[];
      brands: { id: string; name: string }[];
      specifications: { id: string; name: string; values: string[] }[];
      minPrice: number;
      maxPrice: number;
    };
    totalPages: number;
    totalProducts: number;
    errorMessage?: string;
  },
];

export async function fetchProducts(
  filter: SearchParams
): Promise<ProductFetchResult> {
  const limit = Number(filter.perPage) || DBQUERYLIMITS.default;
  const offset = ((filter.page ?? 1) - 1) * limit;
  const sortClause = getSortClause(filter.sort || "newest");

  return dbOperation(async (connection) => {
    try {
      // Parallel fetch for maximum efficiency
      const [allCategories, brands, priceRange, specifications, totalProducts] =
        await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchPriceRange(),
          fetchSpecifications(),
          fetchTotalProducts(filter),
        ]);

      // Get paginated products with full details
      const products = await fetchPaginatedProducts(
        filter,
        allCategories,
        sortClause,
        limit,
        offset
      );

      const totalPages = Math.ceil(totalProducts / limit);

      return [
        products,
        {
          filters: {
            categories: allCategories,
            brands,
            specifications: transformSpecifications(specifications),
            minPrice: priceRange.minPrice,
            maxPrice: priceRange.maxPrice,
          },
          totalPages,
          totalProducts,
        },
      ];
    } catch (error) {
      console.error("Database error:", error);
      return [
        [],
        {
          filters: {
            categories: [],
            brands: [],
            specifications: [],
            minPrice: 0,
            maxPrice: 0,
          },
          totalPages: 0,
          totalProducts: 0,
          errorMessage: "Failed to load products",
        },
      ];
    }
  });
}

// ================= HELPER FUNCTIONS ================= //

async function fetchCategories() {
  return dbOperation(async (connection) => {
    const [categories] = await connection.query(`
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
    return categories;
  });
}

async function fetchBrands() {
  return dbOperation(async (connection) => {
    const [brands] = await connection.query(`
    SELECT
      brand_id AS id,
      brand_name AS name,
      brand_image
    FROM brands
  `);
    return brands;
  });
}

async function fetchPriceRange() {
  return dbOperation(async (connection) => {
    const [[result]] = await connection.query(`
    SELECT
      MIN(product_price) AS minPrice,
      MAX(product_price) AS maxPrice
    FROM products
    WHERE product_status = 'approved'
  `);
    return {
      minPrice: result?.minPrice || 0,
      maxPrice: result?.maxPrice || 0,
    };
  });
}

async function fetchSpecifications() {
  return dbOperation(async (connection) => {
    const [specs] = await connection.query(
      `
    SELECT
      s.specification_id,
      s.specification_name,
      ps.value AS specification_value,
      ps.category_id
    FROM specifications s
    JOIN product_specifications ps ON s.specification_id = ps.specification_id
    GROUP BY s.specification_id, ps.value, ps.category_id
  `
    );
    return specs;
  });
}

async function fetchTotalProducts(filter: SearchParams) {
  return dbOperation(async (connection) => {
    const categoryIds = await getCategoryIds(filter.category);
    const { whereClause, queryParams } = buildFilterConditions(
      filter,
      categoryIds
    );

    const [[{ count }]] = await connection.query(
      `
    SELECT COUNT(DISTINCT p.product_id) AS count
    FROM products p
    WHERE ${whereClause}
  `,
      queryParams
    );

    return count || 0;
  });
}

async function fetchPaginatedProducts(
  filter: SearchParams,
  categories: any[],
  sort: string,
  limit: number,
  offset: number
) {
  const categoryIds = await getCategoryIds(filter.category);
  const { whereClause, queryParams } = buildFilterConditions(
    filter,
    categoryIds
  );

  return dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `
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
        WHERE
            ${whereClause}
            AND p.product_status = 'approved'
        GROUP BY p.product_id
        ORDER BY ${sort}
        LIMIT ? OFFSET ?
  `,
      [...queryParams, limit, offset]
    );

    return mapRowsToProducts(rows);
  });
}

async function mapRowsToProducts(rows: any[]): Promise<Product[]> {
  return Promise.all(
    rows.map(async (row): Promise<Product> => {
      // Process images in parallel
      const [mainImage, thumbnails] = await Promise.all([
        compressAndEncodeBase64(row.main_image),
        Promise.all(
          JSON.parse(row.thumbnails || "[]").map((img: string) =>
            compressAndEncodeBase64(Buffer.from(img))
          )
        ),
      ]);

      return {
        // Core required fields
        id: Number(row.id),
        name: row.name,
        description: row.description,
        price: Number(row.price),
        quantity: Number(row.quantity),
        discount: Number(row.discount),
        main_image: mainImage || "",
        ratings: Number(row.ratings) || 0,

        // Optional fields
        ...(row.sku && { sku: row.sku }),
        ...(row.long_description && { long_description: row.long_description }),
        ...(row.status && { status: row.status as ProductStatus }),
        ...(row.created_at && { created_at: row.created_at }),

        // Category
        ...(row.category_id && { category_id: row.category_id }),
        ...(row.category_name && { category_name: row.category_name }),

        // Brand (both structured and flat)
        ...(row.brand_id && {
          brand: {
            brand_id: row.brand_id,
            brand_name: row.brand_name,
            ...(row.brand_image && { brand_image: row.brand_image }),
          },
          brand_id: row.brand_id.toString(),
          brand_name: row.brand_name,
        }),

        // Images
        ...(row.thumbnails && {
          thumbnails: thumbnails.map((t, i) => ({
            [`thumbnail${i + 1}`]: t || "",
          })),
        }),

        // Tags
        ...(row.tags && {
          tags: row.tags.split(","),
        }),

        // Specifications
        ...(row.specifications && {
          specifications: row.specifications.split("|").map((spec: string) => {
            const [id, name, value, category_id] = spec.split(":");
            return {
              specification_id: id,
              specification_name: name,
              specification_value: value,
              ...(category_id && { category_id }),
            };
          }),
        }),
      };
    })
  );
}

// ================= UTILITY FUNCTIONS ================= //

function transformSpecifications(specs: any[]) {
  const specMap = new Map<
    string,
    { id: string; name: string; values: Set<string> }
  >();

  specs.forEach((spec) => {
    const key = `${spec.specification_id}-${spec.specification_name}`;
    if (!specMap.has(key)) {
      specMap.set(key, {
        id: spec.specification_id.toString(),
        name: spec.specification_name,
        values: new Set(),
      });
    }
    specMap.get(key)?.values.add(spec.specification_value);
  });

  return Array.from(specMap.values()).map((spec) => ({
    id: spec.id,
    name: spec.name,
    values: Array.from(spec.values),
  }));
}

async function getCategoryIds(categoryFilter?: string | string[]) {
  if (!categoryFilter) return [];

  return dbOperation(async (connection) => {
    const [categories] = await connection.query(
      `
    WITH RECURSIVE category_tree AS (
      SELECT category_id FROM categories
      WHERE category_name IN (?) AND status = 'active'
      UNION ALL
      SELECT c.category_id FROM categories c
      JOIN category_tree ct ON c.parent_category_id = ct.category_id
    )
    SELECT category_id FROM category_tree
  `,
      [Array.isArray(categoryFilter) ? categoryFilter : [categoryFilter]]
    );

    return categories.map((c: any) => c.category_id);
  });
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
