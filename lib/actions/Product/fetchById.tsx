"use server";

import { cache } from "@/lib/cache";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "./productTypes";

export interface Product {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "pending" | "approved";
  tags: string[];
  main_image: string;
  thumbnails: {
    thumbnail1: string;
    thumbnail2: string;
    thumbnail3: string;
    thumbnail4: string;
    thumbnail5: string;
  }[];
  category_id: string;
  brand: {
    brand_id: string;
    brand_name: string;
    brand_image: string;
  };
  specifications: {
    specification_id: string;
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  suppliers: {
    supplier_id?: number;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone_number?: string;
    supplier_location?: string;
    isNew?: boolean;
  }[];
}

export async function fetchProductById(product_id: number): Promise<Product> {
  const cacheKey = `product_${product_id}`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() < cachedData.expiry) {
    return cachedData.value as Product;
  }
  cache.delete(cacheKey); // Expired cache cleanup

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
            b.brand_id,
            b.brand_name,
            b.brand_image,
            GROUP_CONCAT(DISTINCT s.supplier_id, ':', s.supplier_name, ':', s.supplier_email, ':', s.supplier_phone_number, ':', s.supplier_location ORDER BY s.supplier_name SEPARATOR '|') AS suppliers,
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
        WHERE p.product_id = ?
        GROUP BY p.product_id
      `;

      const [rows] = await connection.query(query, [product_id]);

      if (!rows.length) {
        throw new Error(`Product with ID ${product_id} not found`);
      }
      const row = rows[0];

      const product: Product = {
        product_id: row.product_id,
        product_name: row.product_name,
        product_sku: row.product_sku,
        product_description: row.product_description,
        product_price: row.product_price,
        product_quantity: row.product_quantity,
        product_discount: row.product_discount,
        product_status: row.product_status,
        category_id: String(row.category_id),

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
          brand_id: row.brand_id || 0,
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

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: product,
        expiry: Date.now() + 3600 * 1000 * 10, // Cache for 10 hours
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
