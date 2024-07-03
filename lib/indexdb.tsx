import { getConnection } from "./db";
import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";

async function indexExists(
  connection: PoolConnection,
  tableName: string,
  indexName: string
): Promise<boolean> {
  const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
    `
    SELECT COUNT(1) as count
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
    AND table_name = ?
    AND index_name = ?;
  `,
    [tableName, indexName]
  );

  return rows[0].count > 0;
}

export async function indexDatabase(): Promise<void> {
  const connection = await getConnection();
  try {
    const indexes = [
      { table: "product", name: "idx_product_id", column: "id" },
      {
        table: "product",
        name: "idx_product_category_id",
        column: "category_id",
      },
      { table: "product", name: "idx_product_name", column: "name" },
      { table: "product", name: "idx_product_sku", column: "sku" },
      { table: "categories", name: "idx_category_name", column: "name" },
      { table: "images", name: "idx_images_id", column: "id" },
    ];

    for (const { table, name, column } of indexes) {
      const exists = await indexExists(connection, table, name);
      if (!exists) {
        await connection.execute(
          `CREATE INDEX ${name} ON ${table}(${column});`
        );
      }
    }

    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  } finally {
    connection.release();
  }
}

indexDatabase().catch((err) => {
  console.error("Failed to index the database:", err);
});
