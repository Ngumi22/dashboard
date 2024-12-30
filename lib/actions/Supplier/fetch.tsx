"use server";
import { cache, setCache } from "@/lib/cache";
import { getConnection } from "@/lib/MysqlDB/initDb";
import { RowDataPacket } from "mysql2/promise";
import { Supplier } from "./supplierTypes";

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

  const connection = await getConnection();
  try {
    // Fetch all unique suppliers
    const [suppliers] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT
        s.supplier_id,
        s.supplier_name,
        s.supplier_email,
        s.supplier_phone_number,
        s.supplier_location
        FROM suppliers s
        JOIN product_suppliers ps
        ON s.supplier_id = ps.supplier_id`);

    if (suppliers.length === 0) {
      return null; // Return null if no suppliers exists
    }

    // Map the result
    const uniqueSuppliers: Supplier[] = await Promise.all(
      suppliers.map(async (supplier) => ({
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.supplier_name,
        supplier_email: supplier.supplier_email,
        supplier_phone_number: supplier.supplier_phone_number,
        supplier_location: supplier.supplier_location,
      }))
    );

    // Cache the result with an expiry time
    cache.set(cacheKey, {
      value: uniqueSuppliers,
      expiry: Date.now() + 36 * 10, // 1 hour expiration
    });

    return uniqueSuppliers;
  } catch (error) {
    console.error("Error fetching unique suppliers:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function fetchSupplierById(supplier_id: number) {
  const cacheKey = `supplier_${supplier_id}`;

  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return cachedData.value; // Return cached data if it hasn't expired
    }
    cache.delete(cacheKey); // Invalidate expired cache
  }

  const connection = await getConnection();
  try {
    // Query the database
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT supplier_id, supplier_name, supplier_email, supplier_phone_number, supplier_location FROM suppliers WHERE supplier_id = ?`,
      [supplier_id]
    );

    // If no rows are returned, return null
    if (rows.length === 0) {
      return null;
    }

    // Map database results to a Supplier object
    const supplier: Supplier = {
      supplier_id: rows[0].supplier_id,
      supplier_name: rows[0].supplier_name,
      supplier_email: rows[0].supplier_email,
      supplier_phone_number: rows[0].supplier_phone_number,
      supplier_location: rows[0].supplier_location,
    };

    setCache(cacheKey, supplier, { ttl: 60 }); // Cache for 1 minutes

    return supplier;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch supplier");
  } finally {
    connection.release();
  }
}
