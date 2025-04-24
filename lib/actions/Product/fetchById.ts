"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { compressAndEncodeBase64 } from "../utils";

export async function fetchProductsByIds(productIds: number[]) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    //console.warn("⚠️ No product IDs provided for validation.");
    return [];
  }

  return dbOperation(async (connection) => {
    try {
      //console.log("🔍 Fetching products for IDs:", productIds);

      const placeholders = productIds.map(() => "?").join(",");
      const query = `SELECT product_id AS id, product_name, product_price, product_quantity FROM products WHERE product_id IN (${placeholders})`;

      // console.log("🛠 Executing query:", query, "with values:", productIds);

      const [rows] = await connection.execute(query, productIds);

      // console.log("✅ Fetched products from DB:", rows);

      if (!Array.isArray(rows) || rows.length === 0) {
        //console.warn("⚠️ No matching products found for IDs:", productIds);
        return [];
      }

      return rows;
    } catch (error) {
      // console.error("❌ Error executing SQL query:", error);
      throw new Error("Failed to fetch product details");
    }
  });
}

export async function fetchProductById(productId: number) {
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
            p.long_description,
            p.category_id,
            DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at,
            b.brand_id,
            b.brand_name,
            b.brand_image,
            c.category_name,
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
        LEFT JOIN categories c ON p.category_id = c.category_id
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
        AND p.product_status = 'approved'
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
        long_description: row.long_description,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        discount: parseFloat(row.discount),
        main_image: compressedMainImage || "",
        brand_name: row.brand_name,
        category_name: row.category_name,
        specifications,
        ratings: row.ratings,
        tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Failed to fetch product details");
    }
  });
}
