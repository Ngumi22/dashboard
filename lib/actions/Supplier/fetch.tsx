"use server";

import { cache, CacheUtil } from "@/lib/cache";
import { Supplier } from "./supplierTypes";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueSuppliers(): Promise<Supplier[]> {
  const cacheKey = "suppliers";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Supplier[]; // Ensure data is returned as an array
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }
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
      cache.set(cacheKey, { value: [], expiry: Date.now() + 3600 * 10 });
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

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueSuppliers,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    return uniqueSuppliers;
  });
}

export async function fetchSupplierById(
  supplier_id: number
): Promise<Supplier | null> {
  const cacheKey = `supplier_${supplier_id}`;

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Supplier; // Return cached data as Banner
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

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

    cache.set(cacheKey, {
      value: processedSupplier,
      expiry: Date.now() + 3600 * 10, // Cache for 10 hours
    });

    return processedSupplier;
  });
}
