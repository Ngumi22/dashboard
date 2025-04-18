"use server";

import { DBQUERYLIMITS } from "@/lib/Constants";
import {
  Product,
  ProductStatus,
  SearchParams,
  Specification,
  Supplier,
} from "./productTypes";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export async function fetchProducts(
  currentPage: number,
  filter: SearchParams
): Promise<{ products: Product[]; errorMessage?: string }> {
  const limit =
    DBQUERYLIMITS[filter.type as keyof typeof DBQUERYLIMITS] ||
    DBQUERYLIMITS.default;
  const offset = (currentPage - 1) * limit;

  return dbOperation(async (connection) => {
    try {
      const { whereClause, queryParams } = buildFilterConditions(filter);
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
          p.category_id,
          DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
          b.brand_id,
          b.brand_name,
          b.brand_image,
          GROUP_CONCAT(DISTINCT CONCAT(s.supplier_id, ':', s.supplier_name, ':', s.supplier_email, ':', s.supplier_phone_number, ':', s.supplier_location) ORDER BY s.supplier_name SEPARATOR '|') AS suppliers,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          MAX(pi.main_image) AS main_image,
          MAX(pi.thumbnail_image1) AS thumbnail1,
          MAX(pi.thumbnail_image2) AS thumbnail2,
          MAX(pi.thumbnail_image3) AS thumbnail3,
          MAX(pi.thumbnail_image4) AS thumbnail4,
          MAX(pi.thumbnail_image5) AS thumbnail5,
          COALESCE(GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ','), '') AS tags,
          COALESCE(GROUP_CONCAT(DISTINCT CONCAT(spec.specification_id, ':', spec.specification_name, ':', ps.value, ':', p.category_id) ORDER BY spec.specification_name SEPARATOR '|'), '') AS specifications
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_suppliers psup ON p.product_id = psup.product_id
      LEFT JOIN suppliers s ON psup.supplier_id = s.supplier_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      LEFT JOIN product_specifications ps ON p.product_id = ps.product_id
      LEFT JOIN specifications spec ON ps.specification_id = spec.specification_id
      LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
      WHERE
          ${whereClause}
          AND p.product_status = 'approved'
      GROUP BY p.product_id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?`;

      queryParams.push(limit, offset);
      const [rows] = await connection.query(query, queryParams);

      // Map rows to Product interface
      const products: Product[] = await mapRowsToProducts(rows);

      const result = { products };

      return result;
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      return { products: [], errorMessage: "Unable to load products." };
    } finally {
      connection.release();
    }
  });
}

// Helper to map database rows to Product objects
async function mapRowsToProducts(rows: any[]): Promise<Product[]> {
  return Promise.all(
    rows.map(async (row): Promise<Product> => {
      const compressedMainImage: string =
        (await compressAndEncodeBase64(row.main_image || null)) ?? "";
      const compressedThumbnails: string[] = await Promise.all([
        compressAndEncodeBase64(row.thumbnail1 || null).then(
          (result) => result ?? ""
        ),
        compressAndEncodeBase64(row.thumbnail2 || null).then(
          (result) => result ?? ""
        ),
        compressAndEncodeBase64(row.thumbnail3 || null).then(
          (result) => result ?? ""
        ),
        compressAndEncodeBase64(row.thumbnail4 || null).then(
          (result) => result ?? ""
        ),
        compressAndEncodeBase64(row.thumbnail5 || null).then(
          (result) => result ?? ""
        ),
      ]);

      // Parse suppliers and specifications
      const suppliers: Supplier[] = row.suppliers
        ? row.suppliers.split("|").map((supplier: string): Supplier => {
            const [
              supplier_id,
              supplier_name,
              supplier_email,
              supplier_phone_number,
              supplier_location,
            ] = supplier.split(":");
            return {
              supplier_id: parseInt(supplier_id),
              supplier_name,
              supplier_email,
              supplier_phone_number,
              supplier_location,
            };
          })
        : [];

      const specifications: Specification[] = row.specifications
        ? row.specifications.split("|").map((spec: string): Specification => {
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
        sku: row.sku,
        description: row.description,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        discount: parseFloat(row.discount),
        status: row.status as ProductStatus,
        tags: row.tags ? row.tags.split(",") : [],
        main_image: compressedMainImage || "",
        thumbnails: [
          {
            thumbnail1: compressedThumbnails[0] || "",
            thumbnail2: compressedThumbnails[1] || "",
            thumbnail3: compressedThumbnails[2] || "",
            thumbnail4: compressedThumbnails[3] || "",
            thumbnail5: compressedThumbnails[4] || "",
          },
        ],
        category_id: row.category_id.toString(),
        created_at: row.created_at,
        brand: {
          brand_id: row.brand_id.toString(),
          brand_name: row.brand_name,
          brand_image: (await compressAndEncodeBase64(row.brand_image)) ?? "",
        },
        specifications,
        suppliers,
        ratings: row.ratings,
      };
    })
  );
}

// Helper to build WHERE clause dynamically
function buildFilterConditions(filter: SearchParams) {
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
    conditions.push("b.brand_name = ?");
    params.push(filter.brand);
  }
  if (filter.category) {
    conditions.push("p.category_id = ?");
    params.push(filter.category);
  }
  if (filter.status !== undefined) {
    conditions.push("p.product_status = ?");
    params.push(filter.status);
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

  // Handle filtering by tags (supports multiple tags)
  if (filter.tags && filter.tags.length > 0) {
    const tagConditions = filter.tags.map(() => "t.tag_name = ?").join(" OR ");
    conditions.push(`(${tagConditions})`);
    params.push(...filter.tags);
  }

  // Handle filtering by specifications
  if (filter.specifications) {
    Object.entries(filter.specifications).forEach(([specName, specValue]) => {
      conditions.push(
        "EXISTS (SELECT 1 FROM product_specifications ps INNER JOIN specifications spec ON ps.specification_id = spec.specification_id WHERE ps.product_id = p.product_id AND spec.specification_name = ? AND ps.value = ?)"
      );
      params.push(specName, specValue);
    });
  }

  return {
    whereClause: conditions.length > 0 ? conditions.join(" AND ") : "1",
    queryParams: params,
  };
}

export async function fetchProductById(product_id: number): Promise<Product> {
  return dbOperation(async (connection) => {
    try {
      const query = `
        SELECT
            p.product_id,
            p.product_name,
            p.product_sku,
            p.product_price,
            p.product_discount,
            p.product_quantity,
            p.product_status,
            p.product_description,
            p.category_id,
            DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
            b.brand_id,
            b.brand_name,
            b.brand_image,
            GROUP_CONCAT(DISTINCT s.supplier_id, ':', s.supplier_name, ':', s.supplier_email, ':', s.supplier_phone_number, ':', s.supplier_location ORDER BY s.supplier_name SEPARATOR '|') AS suppliers,
             COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
            MAX(pi.main_image) AS main_image,
            MAX(pi.thumbnail_image1) AS thumbnail1,
            MAX(pi.thumbnail_image2) AS thumbnail2,
            MAX(pi.thumbnail_image3) AS thumbnail3,
            MAX(pi.thumbnail_image4) AS thumbnail4,
            MAX(pi.thumbnail_image5) AS thumbnail5,
            COALESCE(GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ','), '') AS tags,
            COALESCE(GROUP_CONCAT(DISTINCT spec.specification_id, ':', spec.specification_name, ':', ps.value, ':', p.category_id ORDER BY spec.specification_name SEPARATOR '|'), '') AS specifications
        FROM products p
        LEFT JOIN product_images pi ON p.product_id = pi.product_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN product_suppliers psup ON p.product_id = psup.product_id
        LEFT JOIN suppliers s ON psup.supplier_id = s.supplier_id
        LEFT JOIN product_tags pt ON p.product_id = pt.product_id
        LEFT JOIN tags t ON pt.tag_id = t.tag_id
        LEFT JOIN product_specifications ps ON p.product_id = ps.product_id
        LEFT JOIN specifications spec ON ps.specification_id = spec.specification_id
        LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
        WHERE p.product_id = ?
        GROUP BY p.product_id
      `;

      const [rows] = await connection.query(query, [product_id]);

      if (!rows.length) {
        throw new Error(`Product with ID ${product_id} not found`);
      }
      const row = rows[0];

      const product: Product = {
        id: row.product_id,
        name: row.product_name,
        sku: row.product_sku,
        description: row.product_description,
        price: parseFloat(row.product_price),
        quantity: parseInt(row.product_quantity),
        discount: parseFloat(row.product_discount),
        status: row.product_status as ProductStatus,
        category_id: String(row.category_id),
        created_at: row.created_at,
        ratings: row.ratings,
        tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
        main_image: (await compressAndEncodeBase64(row.main_image)) ?? "",
        thumbnails: await Promise.all([
          {
            thumbnail1: (await compressAndEncodeBase64(row.thumbnail1)) ?? "",
            thumbnail2: (await compressAndEncodeBase64(row.thumbnail2)) ?? "",
            thumbnail3: (await compressAndEncodeBase64(row.thumbnail3)) ?? "",
            thumbnail4: (await compressAndEncodeBase64(row.thumbnail4)) ?? "",
            thumbnail5: (await compressAndEncodeBase64(row.thumbnail5)) ?? "",
          },
        ]),
        brand: {
          brand_id: row.brand_id?.toString() || "0",
          brand_name: row.brand_name,
          brand_image: (await compressAndEncodeBase64(row.brand_image)) ?? "",
        },

        suppliers: row.suppliers
          ? row.suppliers.split("|").map((supplier: string) => {
              const [id, name, email, phone, location] = supplier.split(":");
              return {
                supplier_id: id ? Number(id) : undefined,
                supplier_name: name || undefined,
                supplier_email: email || undefined,
                supplier_phone_number: phone || undefined,
                supplier_location: location || undefined,
              };
            })
          : [],

        specifications: row.specifications
          ? row.specifications.split("|").map((spec: string) => {
              const [id, name, value, category_id] = spec.split(":");
              return {
                specification_id: id,
                specification_name: name,
                specification_value: value,
                category_id,
              };
            })
          : [],
      };

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
  return dbOperation(async (connection) => {
    try {
      const result = await connection.query(
        `SELECT * FROM products
          WHERE LOWER(product_name) = LOWER(${productName})`
      );

      if (result.rows.length === 0) {
        return null; // No product found
      }

      return result.rows[0]; // Return the first matching product
    } catch (error) {
      console.error("Error fetching product name:", error);
      throw error;
    }
  });
}

// server action to fetch products and filter options
export async function fetchProductsAndFilters(
  currentPage: number,
  filter: SearchParams
): Promise<{
  products: Product[];
  filters: {
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    specifications: { id: string; name: string; values: string[] }[];
    tags: string[];
    minPrice: number;
    maxPrice: number;
  };
  errorMessage?: string;
}> {
  const limit =
    DBQUERYLIMITS[filter.type as keyof typeof DBQUERYLIMITS] ||
    DBQUERYLIMITS.default;
  const offset = (currentPage - 1) * limit;

  return dbOperation(async (connection) => {
    try {
      const { whereClause, queryParams } = buildFilterConditions(filter);
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
          p.category_id,
          DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
          b.brand_id,
          b.brand_name,
          b.brand_image,
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
          MAX(pi.main_image) AS main_image,
          COALESCE(GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ','), '') AS tags,
          COALESCE(GROUP_CONCAT(DISTINCT CONCAT(spec.specification_id, ':', spec.specification_name, ':', ps.value, ':', p.category_id) ORDER BY spec.specification_name SEPARATOR '|'), '') AS specifications
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      LEFT JOIN product_specifications ps ON p.product_id = ps.product_id
      LEFT JOIN specifications spec ON ps.specification_id = spec.specification_id
      LEFT JOIN product_reviews pr ON p.product_id = pr.product_id
      WHERE ${whereClause}
      GROUP BY p.product_id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?`;

      queryParams.push(limit, offset);
      const [rows] = await connection.query(query, queryParams);

      // Fetch filter options
      const [categories] = await connection.query(
        "SELECT category_id AS id, category_name AS name FROM categories"
      );
      const [brands] = await connection.query(
        "SELECT brand_id AS id, brand_name AS name FROM brands"
      );
      const [specifications] = await connection.query(
        "SELECT specification_id AS id, specification_name AS name, GROUP_CONCAT(DISTINCT value) AS values FROM specifications GROUP BY specification_id"
      );
      const [tags] = await connection.query(
        "SELECT DISTINCT tag_name AS tag FROM tags"
      );
      const [priceRange] = await connection.query(
        "SELECT MIN(product_price) AS minPrice, MAX(product_price) AS maxPrice FROM products"
      );

      const products: Product[] = await mapRowsToProducts(rows);

      const result = {
        products,
        filters: {
          categories,
          brands,
          specifications: specifications.map((spec: any) => ({
            ...spec,
            values: spec.values.split(","),
          })),
          tags: tags.map((tag: any) => tag.tag),
          minPrice: priceRange[0].minPrice,
          maxPrice: priceRange[0].maxPrice,
        },
      };

      return result;
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      return {
        products: [],
        filters: {
          categories: [],
          brands: [],
          specifications: [],
          tags: [],
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
