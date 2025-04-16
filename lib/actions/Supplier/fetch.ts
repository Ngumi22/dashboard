"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { Supplier } from "./supplierTypes";

export async function getUniqueSuppliers(): Promise<Supplier[]> {
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

    // Return an empty array if no suppliers found
    if (!suppliers || suppliers.length === 0) {
      return [];
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

export async function fetchSupplierById(
  supplier_id: number
): Promise<Supplier | null> {
  return dbOperation(async (connection) => {
    const [rows] = await connection.query(
      `SELECT supplier_id, supplier_name, supplier_email, supplier_phone_number, supplier_location
       FROM suppliers
       WHERE supplier_id = ?`,
      [supplier_id]
    );

    if (!rows || rows.length === 0) {
      return null; // Return null if no banner is found
    }
    // Map result to a Supplier object

    const supplier = rows[0];
    const processedSupplier: Supplier = {
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
      supplier_email: supplier.supplier_email,
      supplier_phone_number: supplier.supplier_phone_number,
      supplier_location: supplier.supplier_location,
    };

    return processedSupplier;
  });
}
