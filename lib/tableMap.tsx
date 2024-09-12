"use server";
import { RowDataPacket, FieldPacket } from "mysql2";
import { getConnection } from "./db";

// Custom error class for better error handling
class DatabaseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function mapEntityToEntity(
  entityId1: number,
  entityId2: number,
  tableName: string, // the name of the junction table
  column1: string, // the foreign key column for entity 1
  column2: string // the foreign key column for entity 2
): Promise<void> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Check if mapping already exists
    const [existingMapping]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        `SELECT 1 FROM ${tableName} WHERE ${column1} = ? AND ${column2} = ? LIMIT 1`,
        [entityId1, entityId2]
      );

    if (existingMapping.length === 0) {
      // Insert the mapping if it doesn't exist
      await connection.query(
        `INSERT INTO ${tableName} (${column1}, ${column2}) VALUES (?, ?)`,
        [entityId1, entityId2]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();

    if (error instanceof DatabaseError) {
      throw error;
    } else {
      throw new DatabaseError(
        `Failed to map ${entityId1} to ${entityId2}`,
        500
      );
    }
  } finally {
    connection.release();
  }
}
