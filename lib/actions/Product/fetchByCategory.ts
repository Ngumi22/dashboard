"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  main_image: string; // Base64 encoded
  ratings: number;
  discount: number;
  quantity: number;
  created_at: string;
  category_id: string;
};

export type ProductCategory = {
  name: string;
  products: Product[];
};

export async function fetchProductByCategory(
  category_name: string
): Promise<ProductCategory | null> {
  return dbOperation(async (connection) => {
    try {
      const result = await connection.query(
        `SELECT
            p.product_id AS id,
            p.product_name AS name,
            p.product_description AS description,
            p.product_price AS price,
            DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
            MAX(pi.main_image) AS main_image,
            COALESCE(ROUND(AVG(pr.rating), 1), 0) AS ratings,
            p.product_discount AS discount,
            p.product_quantity AS quantity,
            p.category_id,
            main_c.category_name AS main_category_name
        FROM
            categories main_c
        JOIN
            categories sub_c ON main_c.category_id = sub_c.parent_category_id OR main_c.category_id = sub_c.category_id
        JOIN
            products p ON sub_c.category_id = p.category_id
        LEFT JOIN
            product_images pi ON p.product_id = pi.product_id
        LEFT JOIN
            product_reviews pr ON p.product_id = pr.product_id
        WHERE
            main_c.category_name = ?
            AND main_c.category_status = 'active'
            AND main_c.parent_category_id IS NULL -- Ensures we select only main categories
            AND p.product_status = 'approved'
        GROUP BY
            p.product_id, main_c.category_name -- Group by product ID and main category name
        ORDER BY
            p.product_name ASC;`,
        [category_name]
      );

      const rows = result[0] || [];

      // Convert images to Base64
      const products = await Promise.all(
        rows.map(async (row: any) => {
          const imageUrl = row.main_image;
          const base64Image = await compressAndEncodeBase64(imageUrl);
          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            main_image: base64Image, // Base64 string
            ratings: parseFloat(row.ratings),
            discount: parseFloat(row.discount),
            quantity: row.quantity,
            created_at: row.created_at,
            category_id: row.category_id,
          };
        })
      );

      const category: ProductCategory = { name: category_name, products };

      return category;
    } catch (error: any) {
      console.error(
        `Error fetching products for category ${category_name}:`,
        error
      );
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  });
}
