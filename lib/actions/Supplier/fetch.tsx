"use server";

import { cache, setCache } from "@/lib/cache";
import { Supplier } from "./supplierTypes";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export async function getUniqueSuppliers() {
  const cacheKey = "unique_suppliers";

  // Check if the result is already in the cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
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

    // Cache the result with an expiry time of 1 hour
    setCache(cacheKey, uniqueSuppliers, { ttl: 60 * 60 * 1000 });
    return uniqueSuppliers;
  });
}

export async function fetchSupplierById(
  supplier_id: number
): Promise<Supplier | null> {
  const cacheKey = `supplier_${supplier_id}`;

  // Check if data is in cache
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value as Supplier; // Return cached data if not expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

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

    // Cache the result with a TTL of 60 seconds
    setCache(cacheKey, supplier, { ttl: 60 * 1000 });

    return supplier;
  });
}
