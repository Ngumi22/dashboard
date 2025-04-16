"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";

export const deleteSupplierAction = async (supplier_id: string) => {
  try {
    // Validate supplier_id
    if (!supplier_id || isNaN(parseInt(supplier_id))) {
      throw new Error("Invalid supplier ID provided");
    }

    const parsedId = parseInt(supplier_id);

    // Check if supplier exists and get details for validation
    const supplierDetails = await dbOperation(async (connection) => {
      const [supplier]: any = await connection.execute(
        `SELECT supplier_id FROM suppliers WHERE supplier_id = ? LIMIT 1`,
        [parsedId]
      );
      return supplier[0];
    });

    if (!supplierDetails) {
      throw new Error("Supplier not found");
    }

    // Perform hard delete
    await dbOperation(async (connection) => {
      await connection.execute(`DELETE FROM suppliers WHERE supplier_id = ?`, [
        parsedId,
      ]);
    });

    return {
      success: true,
      message: "Supplier permanently deleted",
      supplier_id: parsedId,
    };
  } catch (error: any) {
    console.error("Error deleting supplier:", error);

    // Handle foreign key constraint errors
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return {
        success: false,
        message: "Cannot delete supplier - referenced by other records",
        supplier_id: supplier_id ? parseInt(supplier_id) : null,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete supplier",
      supplier_id: supplier_id ? parseInt(supplier_id) : null,
    };
  }
};
