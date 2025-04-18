import { RowDataPacket } from "mysql2/promise";
import { Buffer } from "buffer"; // Import buffer for better type consistency
import { getConnection } from "../MysqlDB/initDb";

const LIMITS = {
  brand: 5,
  category: 5,
  default: 10,
};

type ProductStatus = "draft" | "pending" | "approved";

// Define `SearchParams` interface with more explicit typing for query handling.
export interface SearchParams {
  productId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  name?: string;
  brand?: string;
  category?: string;
  status?: string;
  stock?: number;
  tags?: string;
  type?: "brand" | "category" | "default";
}

// ImageFields interface for consistent reuse
export interface ImageFields {
  mainImage: Buffer | null;
  thumbnails: Buffer[];
}

// ProductRow extends RowDataPacket for direct MySQL query compatibility
export interface ProductRow extends RowDataPacket, ImageFields {
  product_id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: ProductStatus;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  tags: string;
  thumbnail1: Buffer | null;
  thumbnail2: Buffer | null;
  thumbnail3: Buffer | null;
  thumbnail4: Buffer | null;
  thumbnail5: Buffer | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: ProductStatus;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: Buffer | null;
    thumbnails: Buffer[];
  };
  tags: string[];
}

// Mapping function to convert `ProductRow` to `Product`
function mapProductRow(row: ProductRow): Product {
  return {
    id: row.product_id,
    name: row.name,
    sku: row.sku,
    price: row.price,
    discount: row.discount,
    quantity: row.quantity,
    category: row.category,
    status: row.status as ProductStatus,
    description: row.description,
    brand: row.brand,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images: {
      mainImage: row.mainImage,
      thumbnails: [
        row.thumbnail1,
        row.thumbnail2,
        row.thumbnail3,
        row.thumbnail4,
        row.thumbnail5,
      ].filter((thumbnail): thumbnail is Buffer => thumbnail !== null),
    },
    tags: row.tags.split(",").map((tag) => tag.trim()),
  };
}

// Function to fetch products with filtering and pagination
export async function fetchFilteredProductsFromDb(
  currentPage: number,
  filter: SearchParams
): Promise<{
  products: Product[];
  errorMessage?: string;
}> {
  const limit = LIMITS[filter.type as keyof typeof LIMITS] || LIMITS.default;
  const offset = (currentPage - 1) * limit;

  const connection = await getConnection();

  try {
    const queryConditions: string[] = [];
    const queryParams: (string | number)[] = [];

    if (filter.minPrice)
      queryConditions.push("p.product_price >= ?"),
        queryParams.push(filter.minPrice);
    if (filter.maxPrice)
      queryConditions.push("p.product_price <= ?"),
        queryParams.push(filter.maxPrice);
    if (filter.minDiscount)
      queryConditions.push("p.product_discount >= ?"),
        queryParams.push(filter.minDiscount);
    if (filter.maxDiscount)
      queryConditions.push("p.product_discount <= ?"),
        queryParams.push(filter.maxDiscount);
    if (filter.name)
      queryConditions.push("p.product_name LIKE ?"),
        queryParams.push(`%${filter.name}%`);
    if (filter.brand)
      queryConditions.push("b.brand_name = ?"), queryParams.push(filter.brand);
    if (filter.category)
      queryConditions.push("c.category_name = ?"),
        queryParams.push(filter.category);
    if (filter.status !== undefined)
      queryConditions.push("p.product_status = ?"),
        queryParams.push(filter.status);
    if (filter.stock)
      queryConditions.push("p.product_quantity >= ?"),
        queryParams.push(filter.stock);
    if (filter.tags) {
      const tags = filter.tags.split(",");
      queryConditions.push(
        `(${tags.map(() => "t.tag_name = ?").join(" OR ")})`
      );
      queryParams.push(...tags);
    }

    const whereClause = queryConditions.length
      ? queryConditions.join(" AND ")
      : "1=1";

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
          COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings, -- Uses "rating" column
          p.created_at AS createdAt,
          p.updated_at AS updatedAt,
          MAX(pi.main_image) AS mainImage,
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
      LEFT JOIN product_reviews pr ON p.product_id = pr.product_id -- Ensure "product_id" exists
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE ${whereClause}
      GROUP BY p.product_id
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?`;

    queryParams.push(limit, offset);

    const [rows] = await connection.query<ProductRow[]>(query, queryParams);
    const products = rows.map(mapProductRow);

    const result = { products };
    return result;
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
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        MAX(pi.main_image) AS mainImage,
        MAX(pi.thumbnail_image1) AS thumbnail1,
        MAX(pi.thumbnail_image2) AS thumbnail2,
        MAX(pi.thumbnail_image3) AS thumbnail3,
        MAX(pi.thumbnail_image4) AS thumbnail4,
        MAX(pi.thumbnail_image5) AS thumbnail5,
        COALESCE(GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ','), '') AS tags
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.product_id = ?
      GROUP BY p.product_id
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
