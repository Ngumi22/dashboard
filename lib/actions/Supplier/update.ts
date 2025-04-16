"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { supplierSchema } from "@/lib/ZodSchemas/supplierSchema";

export const updateSupplierAction = async (
  supplier_id: string,
  formData: FormData
) => {
  try {
    // Convert FormData to plain object and validate
    const formDataObj = Object.fromEntries(formData);
    const validatedData = supplierSchema.parse({
      ...formDataObj,
      supplier_id: supplier_id ? parseInt(supplier_id) : undefined,
    });

    const {
      supplier_name,
      supplier_email,
      supplier_phone_number,
      supplier_location,
    } = validatedData;

    if (!supplier_id) {
      throw new Error("Supplier ID is required.");
    }

    // Fetch the existing supplier
    const existingSupplier = await dbOperation(async (connection) => {
      const [supplier]: any = await connection.execute(
        `SELECT * FROM suppliers WHERE supplier_id = ? LIMIT 1`,
        [supplier_id]
      );
      return supplier.length > 0 ? supplier[0] : null;
    });

    if (!existingSupplier) {
      throw new Error("Supplier not found.");
    }

    // Prepare updates
    const updates: string[] = [];
    const values: any[] = [];
    let hasChanges = false;

    // Check each field for changes
    const fieldsToCheck = [
      { field: "supplier_name", value: supplier_name },
      { field: "supplier_email", value: supplier_email },
      { field: "supplier_phone_number", value: supplier_phone_number },
      { field: "supplier_location", value: supplier_location },
    ];

    fieldsToCheck.forEach(({ field, value }) => {
      if (value !== undefined && value !== existingSupplier[field]) {
        updates.push(`${field} = ?`);
        values.push(value);
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      throw new Error("No changes detected.");
    }

    // Perform the update
    await dbOperation(async (connection) => {
      const query = `
        UPDATE suppliers
        SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE supplier_id = ?
      `;
      await connection.execute(query, [...values, supplier_id]);
    });

    return {
      success: true,
      message: "Supplier updated successfully.",
      supplier_id: parseInt(supplier_id),
    };
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update supplier",
    };
  }
};
