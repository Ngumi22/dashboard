"use server";

import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { getConnection } from "./db";
import { ProductData } from "./types";

export async function getOrCreateCategory(name: string, createdBy: number) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Check if the category exists
    const [existingCategory]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT category_id FROM categories WHERE name = ?",
        [name]
      );

    // If the category exists, return the existing ID
    if (existingCategory.length > 0) {
      await connection.commit();
      return existingCategory[0].category_id;
    }

    // If the category does not exist, insert it
    const [categoryResult]: [any, any] = await connection.query(
      `INSERT INTO categories (name, created_by) VALUES (?, ?)`,
      [name, createdBy]
    );

    const categoryId = categoryResult.insertId;
    console.log(`Inserted new category with ID: ${categoryId}`);

    await connection.commit();
    return categoryId;
  } catch (error) {
    await connection.rollback();
    console.error("Error in getOrCreateCategory:", error);
    throw { message: "Failed to get or create category", statusCode: 500 };
  } finally {
    connection.release();
  }
}

export async function getOrCreateBrand(
  name: string,
  createdBy: number,
  brandLogo: Buffer
): Promise<number> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [existingBrand]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT brand_id FROM brands WHERE name = ?", [
        name,
      ]);

    if (existingBrand.length > 0) {
      return existingBrand[0].brand_id;
    }

    const [brandResult]: [any, any] = await connection.query(
      "INSERT INTO brands (name, brand_logo, created_by) VALUES (?, ?, ?)",
      [name, brandLogo, createdBy]
    );
    const brandId = brandResult.insertId;
    await connection.commit();
    console.log(`Inserted new brand with ID: ${brandId}`);
    return brandId;
  } catch (error) {
    console.error("Error in getOrCreateBrand:", error);
    await connection.rollback();
    throw { message: "Failed to get or create brand", statusCode: 500 };
  } finally {
    connection.release();
  }
}

export async function getOrCreateSupplier(
  name: string,
  contactInfo: string,
  createdBy: number
): Promise<number> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [existingSupplier]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT supplier_id FROM suppliers WHERE name = ?",
        [name]
      );

    if (existingSupplier.length > 0) {
      return existingSupplier[0].supplier_id;
    }

    const [supplierResult]: [any, any] = await connection.query(
      "INSERT INTO suppliers (name, contact_info, created_by) VALUES (?, ?, ?)",
      [name, contactInfo, createdBy]
    );
    const supplierId = supplierResult.insertId;
    await connection.commit();
    console.log(`Inserted new supplier with ID: ${supplierId}`);
    return supplierId;
  } catch (error) {
    console.error("Error in getOrCreateSupplier:", error);
    await connection.rollback();
    throw { message: "Failed to get or create supplier", statusCode: 500 };
  } finally {
    connection.release();
  }
}

export async function insertProduct(
  productData: ProductData,
  createdBy: number
): Promise<number> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const categoryId = await getOrCreateCategory(
      productData.categoryId,
      createdBy
    );
    const brandId = productData.brandId
      ? await getOrCreateBrand(
          productData.brandId,
          createdBy,
          productData.images.main
        )
      : null;
    const supplierId = productData.supplierId
      ? await getOrCreateSupplier(
          productData.supplierId,
          JSON.stringify({}),
          createdBy
        )
      : null;

    const [productResult]: [any, any] = await connection.query(
      `INSERT INTO products (name, description, short_description, price, discount, quantity, status, category_id, brand_id, supplier_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.name,
        productData.description,
        productData.shortDescription,
        productData.price,
        productData.discount,
        productData.quantity,
        productData.status,
        categoryId,
        brandId,
        supplierId,
        createdBy,
      ]
    );
    const productId = productResult.insertId;

    if (productData.images) {
      await Promise.all(
        [
          { image: productData.images.main, main_image: true },
          ...productData.images.thumbnails.map((thumb) => ({
            image: thumb,
            main_image: false,
          })),
        ].map(async (img) => {
          await connection.query(
            "INSERT INTO product_images (product_id, image, main_image) VALUES (?, ?, ?)",
            [productId, img.image, img.main_image]
          );
        })
      );
    }

    await connection.commit();
    console.log(`Inserted new product with ID: ${productId}`);
    return productId;
  } catch (error) {
    console.error("Error in insertProduct:", error);
    await connection.rollback();
    throw { message: "Failed to insert product", statusCode: 500 };
  } finally {
    connection.release();
  }
}

export async function addProductSpecifications(
  productId: number,
  specifications: ProductData["specifications"]
): Promise<void> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    await Promise.all(
      specifications.map(async (spec) => {
        const [existingSpec]: [RowDataPacket[], FieldPacket[]] =
          await connection.query(
            "SELECT specification_id FROM specifications WHERE name = ?",
            [spec.name]
          );

        const specId =
          existingSpec.length > 0
            ? existingSpec[0].specification_id
            : await createSpecification(spec.name);

        await connection.query(
          "INSERT INTO product_specifications (product_id, specification_id, value) VALUES (?, ?, ?)",
          [productId, specId, spec.value]
        );
      })
    );

    await connection.commit();
  } catch (error) {
    console.error("Error in addProductSpecifications:", error);
    await connection.rollback();
    throw { message: "Failed to add product specifications", statusCode: 500 };
  } finally {
    connection.release();
  }
}

async function createSpecification(name: string): Promise<number> {
  const connection = await getConnection();
  try {
    const [result]: [any, any] = await connection.query(
      "INSERT INTO specifications (name) VALUES (?)",
      [name]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error in createSpecification:", error);
    throw { message: "Failed to create specification", statusCode: 500 };
  } finally {
    connection.release();
  }
}

export async function addProductTags(
  productId: number,
  tags: number[]
): Promise<void> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    await Promise.all(
      tags.map(async (tagId) => {
        await connection.query(
          "INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
          [productId, tagId]
        );
      })
    );

    await connection.commit();
  } catch (error) {
    console.error("Error in addProductTags:", error);
    await connection.rollback();
    throw { message: "Failed to add product tags", statusCode: 500 };
  } finally {
    connection.release();
  }
}
