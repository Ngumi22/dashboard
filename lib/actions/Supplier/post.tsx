"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { NextResponse } from "next/server";
import { z } from "zod";

const SupplierSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required."),
  supplier_email: z.string().email("Invalid email address."),
  supplier_phone_number: z.string().optional(),
  supplier_location: z.string().optional(),
});

export async function createSupplier(formData: FormData, productId: number) {
  try {
    // Step 1: Parse and validate suppliers
    const suppliersArray: Array<z.infer<typeof SupplierSchema>> = [];
    const keys = Array.from(formData.keys());
    for (const key of keys) {
      if (key.startsWith("suppliers[")) {
        const value = formData.get(key);
        if (value) {
          try {
            const parsedSupplier = SupplierSchema.parse(
              JSON.parse(value.toString())
            );
            suppliersArray.push(parsedSupplier);
          } catch (error) {
            console.error(`Invalid supplier data for key: ${key}`, error);
            throw new Error(
              `Invalid supplier data for key: ${key}. Ensure the JSON is correct and meets validation rules.`
            );
          }
        }
      }
    }

    if (suppliersArray.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid suppliers provided.",
        supplierIds: [],
      });
    }

    // Step 2: Perform database operations
    return dbOperation(async (connection) => {
      const supplierIds = new Set<number>(); // Use a set to avoid duplicates
      const newSuppliers: Array<z.infer<typeof SupplierSchema>> = [];
      const existingSupplierMap = new Map<string, number>(); // Map supplier_name -> supplier_id

      await connection.beginTransaction();

      try {
        // Step 3: Fetch existing suppliers in bulk
        const supplierNames = suppliersArray.map((s) => s.supplier_name);
        const [existingSuppliers] = await connection.query(
          `SELECT supplier_id, supplier_name FROM suppliers WHERE supplier_name IN (?) FOR UPDATE`,
          [supplierNames]
        );

        // Populate existing suppliers map
        for (const existingSupplier of existingSuppliers as {
          supplier_id: number;
          supplier_name: string;
        }[]) {
          existingSupplierMap.set(
            existingSupplier.supplier_name,
            existingSupplier.supplier_id
          );
        }

        // Step 4: Identify new suppliers
        for (const supplier of suppliersArray) {
          if (!existingSupplierMap.has(supplier.supplier_name)) {
            newSuppliers.push(supplier);
          }
        }

        // Step 5: Insert new suppliers in bulk (if any)
        if (newSuppliers.length > 0) {
          const insertValues = newSuppliers.map((supplier) => [
            supplier.supplier_name,
            supplier.supplier_email || null,
            supplier.supplier_phone_number || null,
            supplier.supplier_location || null,
            null, // created_by defaults to NULL
            null, // updated_by defaults to NULL
          ]);

          const [insertResult] = await connection.query(
            `INSERT INTO suppliers (
              supplier_name,
              supplier_email,
              supplier_phone_number,
              supplier_location,
              created_by,
              updated_by
            ) VALUES ?`,
            [insertValues]
          );

          // Map newly inserted suppliers
          const startId = (insertResult as { insertId: number }).insertId;
          newSuppliers.forEach((supplier, index) => {
            const supplierId = startId + index;
            existingSupplierMap.set(supplier.supplier_name, supplierId);
          });
        }

        // Step 6: Map suppliers to the product
        const mappingValues = suppliersArray.map((supplier) => {
          const supplierId = existingSupplierMap.get(supplier.supplier_name);
          if (!supplierId) {
            throw new Error(
              `Supplier ID not found for ${supplier.supplier_name}`
            );
          }
          supplierIds.add(supplierId); // Add to unique ID set
          return [productId, supplierId];
        });

        await connection.query(
          `INSERT IGNORE INTO product_suppliers (product_id, supplier_id) VALUES ?`,
          [mappingValues]
        );

        // Commit transaction
        await connection.commit();

        return NextResponse.json({
          success: true,
          message: "Suppliers added and mapped to the product successfully.",
          supplierIds: Array.from(supplierIds),
        });
      } catch (error) {
        await connection.rollback();
        console.error("Error during supplier creation:", error);
        throw error;
      }
    });
  } catch (error) {
    console.error("Error in createSupplier:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while adding suppliers.",
        supplierIds: [],
      },
      { status: 500 }
    );
  }
}
