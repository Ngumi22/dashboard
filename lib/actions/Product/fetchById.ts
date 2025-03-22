"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";
import { MinimalProduct } from "@/app/store/cart";

export async function fetchProductById(productId: number) {
  return dbOperation(async (connection) => {
    try {
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
        WHERE p.product_id = ?
        GROUP BY p.product_id
      `;

      const [rows] = await connection.query(query, [productId]);

      if (rows.length === 0) {
        throw new Error("Product not found");
      }

      const row = rows[0];

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
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Failed to fetch product details");
    }
  });
}

export async function fetchProductsByIds(ids: number[]) {
  return dbOperation(async (connection) => {
    try {
      const query = `SELECT * FROM products WHERE product_id = ?`;

      const [rows] = await connection.query(query, [ids]);
      return rows as MinimalProduct[];
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      throw new Error("Failed to fetch product details");
    }
  });
}
