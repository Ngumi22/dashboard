"use server";

import { cache } from "@/lib/cache";
import { Product, ProductStatus } from "./productTypes";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { CACHE_TTL } from "@/lib/Constants";

export async function fetchProductByName(
  product_name: string
): Promise<Product> {
  const cacheKey = `product_${product_name}`;

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
        WHERE
            p.product_name = ?
            AND p.product_status = 'approved'
        GROUP BY p.product_id
      `;

      const [rows] = await connection.query(query, [product_name]);

      if (!rows.length) {
        throw new Error(`Product with name ${product_name} not found`);
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

      // Cache the result with an expiry time
      cache.set(cacheKey, {
        value: product,
        expiry: Date.now() + CACHE_TTL,
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
