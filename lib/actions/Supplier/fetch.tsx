"use server";

import { CacheUtil } from "@/lib/cache";
import { Supplier } from "./supplierTypes";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueSuppliers() {
  return dbOperation(async (connection) => {
    // Fetch all unique suppliers
    const [suppliers] = await connection.query(`
      SELECT DISTINCT
        s.supplier_id,
        s.supplier_name,
        s.supplier_email,
        s.supplier_phone_number,
        s.supplier_location
      FROM suppliers s
      JOIN product_suppliers ps
      ON s.supplier_id = ps.supplier_id
    `);

    // If no suppliers exist, return null
    if (!suppliers || suppliers.length === 0) {
      return null;
    }

    // Map the result into Supplier objects
    const uniqueSuppliers: Supplier[] = suppliers.map((supplier: any) => ({
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
      supplier_email: supplier.supplier_email,
      supplier_phone_number: supplier.supplier_phone_number,
      supplier_location: supplier.supplier_location,
    }));

    return uniqueSuppliers;
  });
}

export async function fetchSupplierById(supplier_id: number): Promise<any> {
  const cacheKey = `supplier_${supplier_id}`;

  if (!supplier_id) throw new Error("Invalid supplier ID");

  const cachedProduct = CacheUtil.get<Supplier>(cacheKey);
  if (cachedProduct) return cachedProduct;

  return dbOperation(async (connection) => {
    const [rows]: [Supplier[]] = await connection.query(
      `SELECT supplier_id, supplier_name, supplier_email, supplier_phone_number, supplier_location
       FROM suppliers
       WHERE supplier_id = ?`,
      [supplier_id]
    );

    if (rows.length === 0) {
      return null; // No supplier found
    }

    // Map result to a Supplier object
    const supplier: Supplier = {
      supplier_id: rows[0].supplier_id,
      supplier_name: rows[0].supplier_name,
      supplier_email: rows[0].supplier_email,
      supplier_phone_number: rows[0].supplier_phone_number,
      supplier_location: rows[0].supplier_location,
    };

    CacheUtil.set(cacheKey, supplier); // Use CacheUtil for caching

    return supplier;
  });
}
