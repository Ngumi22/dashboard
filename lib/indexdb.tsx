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

export async function createIndexes() {
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
      { table: "users", name: "idx_users_email", column: "email" },
      { table: "orders", name: "idx_orders_user_id", column: "user_id" },
      {
        table: "order_items",
        name: "idx_order_items_order_id",
        column: "order_id",
      },
      {
        table: "inventory",
        name: "idx_inventory_product_id",
        column: "product_id",
      },
      {
        table: "reviews",
        name: "idx_reviews_product_id",
        column: "product_id",
      },
      { table: "reviews", name: "idx_reviews_user_id", column: "user_id" },
      {
        table: "admin_activity",
        name: "idx_admin_activity_admin_id",
        column: "admin_id",
      },
      {
        table: "website_traffic",
        name: "idx_website_traffic_visit_date",
        column: "visit_date",
      },
      { table: "financials", name: "idx_financials_date", column: "date" },
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

createIndexes().catch((err) => {
  console.error("Failed to create indexes:", err);
});
