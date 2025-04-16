"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { supplierSchema } from "@/lib/ZodSchemas/supplierSchema";
import { z } from "zod";

// In your server actions (update and create), ensure they return the same type structure:
export type SupplierActionResponse = {
  success: boolean;
  message: string;
  supplier_id?: number;
  errors?: {
    fieldErrors?: Record<string, string[]>;
    formError?: string;
  };
};

export async function createSupplier(formData: FormData, productId: number) {
  try {
    // Parse and validate suppliers
    const suppliersArray: Array<z.infer<typeof supplierSchema>> = [];
    const keys = Array.from(formData.keys());
    for (const key of keys) {
      if (key.startsWith("suppliers[")) {
        const value = formData.get(key);
        if (value) {
          try {
            const parsedSupplier = supplierSchema.parse(
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
      throw new Error("No valid suppliers provided.");
    }

    const supplierIds = new Set<number>(); // Use a set to avoid duplicates
    const newSuppliers: Array<z.infer<typeof supplierSchema>> = [];
    const existingSupplierMap = new Map<string, number>(); // Map supplier_name -> supplier_id

    // Fetch existing suppliers in bulk
    const supplierNames = suppliersArray.map((s) => s.supplier_name);

    return dbOperation(async (connection) => {
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

      // Identify new suppliers
      for (const supplier of suppliersArray) {
        if (!existingSupplierMap.has(supplier.supplier_name)) {
          newSuppliers.push(supplier);
        }
      }

      // Insert new suppliers in bulk (if any)
      if (newSuppliers.length > 0) {
        const insertValues = newSuppliers.map((supplier) => [
          supplier.supplier_name,
          supplier.supplier_email || null,
          supplier.supplier_phone_number || null,
          supplier.supplier_location || null,
        ]);

        const [insertResult] = await connection.query(
          `INSERT INTO suppliers (
          supplier_name,
          supplier_email,
          supplier_phone_number,
          supplier_location
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

      // Map suppliers to the product
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

      console.log("Suppliers added and mapped to the product successfully");

      return {
        success: true,
        message: "Suppliers added and mapped to the product successfully.",
        supplierIds: Array.from(supplierIds),
      };
    });
  } catch (error) {
    console.error("Error during supplier creation:", error);
    throw error;
  }
}

export async function addSupplier(
  formData: FormData
): Promise<SupplierActionResponse> {
  try {
    // Convert FormData and validate with Zod
    const rawData = Object.fromEntries(formData);
    const validation = supplierSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: {
          fieldErrors: validation.error.flatten().fieldErrors,
        },
      };
    }

    const {
      supplier_name,
      supplier_email,
      supplier_phone_number,
      supplier_location,
    } = validation.data;

    return await dbOperation(async (connection) => {
      // Check for existing supplier (including soft-deleted)
      const [existing] = await connection.query(
        `SELECT supplier_id FROM suppliers
         WHERE supplier_email = ?
         LIMIT 1`,
        [supplier_email]
      );

      if (existing.length > 0) {
        return {
          success: false,
          message: "Supplier with this email already exists",
          errors: {
            fieldErrors: {
              supplier_email: ["This email is already in use"],
            },
          },
        };
      }

      // Create new supplier
      const [result] = await connection.query(
        `INSERT INTO suppliers (
          supplier_name,
          supplier_email,
          supplier_phone_number,
          supplier_location
        ) VALUES (?, ?, ?, ?)`,
        [
          supplier_name,
          supplier_email,
          supplier_phone_number,
          supplier_location,
        ]
      );

      return {
        success: true,
        message: "Supplier created successfully",
        supplierId: result.insertId,
      };
    });
  } catch (error) {
    console.error("Supplier creation error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      errors: {
        formError: "Failed to create supplier. Please try again.",
      },
    };
  }
}
