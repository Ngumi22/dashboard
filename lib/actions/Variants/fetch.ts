"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { Variant } from "./types";

export async function fetchVariantsByProductId(
  productId: number
): Promise<Variant[]> {
  if (!productId) throw new Error("Invalid product ID");

  try {
    return await dbOperation(async (connection) => {
      const [variants] = await connection.query(
        `
        SELECT
          v.variant_id,
          v.product_id,
          v.variant_price,
          v.variant_quantity,
          v.variant_status,
          v.created_at,
          v.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'specificationId', vc.specification_id,
              'specificationName', s.specification_name,
              'variantValueId', vc.variant_value_id,
              'variantValue', vv.value
            )
          ) AS specifications,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'imageId', vi.variant_image_id,
              'imageType', vi.image_type,
              'imageData', TO_BASE64(vi.image_data)
            )
          ) AS images
        FROM variants v
        LEFT JOIN variant_combinations vc ON v.variant_id = vc.variant_id
        LEFT JOIN specifications s ON vc.specification_id = s.specification_id
        LEFT JOIN variant_values vv ON vc.variant_value_id = vv.variant_value_id
        LEFT JOIN variant_images vi ON v.variant_id = vi.variant_id
        WHERE v.product_id = ? AND v.deleted_at IS NULL
        GROUP BY v.variant_id
        ORDER BY v.variant_id DESC
        `,
        [productId]
      );

      return variants;
    });
  } catch (error) {
    console.error("Error fetching variants:", error);
    throw new Error("Failed to fetch variants");
  }
}

export async function fetchVariantById(
  variantId: number
): Promise<Variant | null> {
  if (!variantId) throw new Error("Invalid variant ID");

  try {
    return await dbOperation(async (connection) => {
      const [variant] = await connection.query(
        `
        SELECT
          v.variant_id,
          v.product_id,
          v.variant_price,
          v.variant_quantity,
          v.variant_status,
          v.created_at,
          v.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'specificationId', vc.specification_id,
              'specificationName', s.specification_name,
              'variantValueId', vc.variant_value_id,
              'variantValue', vv.value
            )
          ) AS specifications,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'imageId', vi.variant_image_id,
              'imageType', vi.image_type,
              'imageData', TO_BASE64(vi.image_data)
            )
          ) AS images
        FROM variants v
        LEFT JOIN variant_combinations vc ON v.variant_id = vc.variant_id
        LEFT JOIN specifications s ON vc.specification_id = s.specification_id
        LEFT JOIN variant_values vv ON vc.variant_value_id = vv.variant_value_id
        LEFT JOIN variant_images vi ON v.variant_id = vi.variant_id
        WHERE v.variant_id = ? AND v.deleted_at IS NULL
        GROUP BY v.variant_id
        `,
        [variantId]
      );

      return variant.length > 0 ? variant[0] : null;
    });
  } catch (error) {
    console.error("Error fetching variant:", error);
    throw new Error("Failed to fetch variant");
  }
}
