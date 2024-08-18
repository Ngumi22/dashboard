import { getCache, setCache } from "./cache";
import { getConnection } from "./db";
import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";

// This module is responsible for creating indexes. It also imports the getConnection function from db.ts

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

export async function createIndexes(): Promise<void> {
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
        column: "adminId",
      },
      {
        table: "website_traffic",
        name: "idx_website_traffic_visit_date",
        column: "visitDate",
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

// Reviews report

export async function generateReviewsReport(): Promise<any[]> {
  const cacheKey = `reviews_report`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const connection = await getConnection();

  try {
    const query = `
      SELECT
        r.id AS review_id,
        r.rating,
        r.comment,
        r.createdAt,
        u.email AS user_email,
        p.name AS product_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN product p ON r.product_id = p.id
      ORDER BY r.createdAt DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const reviewsReport = rows.map((row) => ({
      review_id: row.review_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      user_email: row.user_email,
      product_name: row.product_name,
    }));

    setCache(cacheKey, reviewsReport);
    return reviewsReport;
  } catch (error) {
    console.error("Error generating reviews report:", error);
    throw new Error("Failed to generate reviews report");
  } finally {
    connection.release();
  }
}

// Revenue, profit and cogs
export async function generateRevenueAndProfitReport(
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  const connection = await getConnection();

  try {
    let query = `
      SELECT
        SUM(o.total_price) AS total_revenue,
        SUM(c.cogs) AS total_cogs,
        (SUM(o.total_price) - SUM(c.cogs)) AS total_profit,
        ((SUM(o.total_price) - SUM(c.cogs)) / SUM(o.total_price)) * 100 AS profit_margin
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN costs c ON oi.product_id = c.product_id
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ` WHERE o.order_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    const [rows] = await connection.query<RowDataPacket[]>(query, params);
    const revenueAndProfitReport = rows.length
      ? rows[0]
      : { total_revenue: 0, total_cogs: 0, total_profit: 0, profit_margin: 0 };

    return [revenueAndProfitReport];
  } catch (error) {
    console.error("Error generating revenue and profit report:", error);
    throw new Error("Failed to generate revenue and profit report");
  } finally {
    connection.release();
  }
}

// Customer report

export async function generateCustomerReport(): Promise<any[]> {
  const connection = await getConnection();

  try {
    const query = `
      SELECT
        u.id AS user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        SUM(o.total_price) AS total_spent,
        COUNT(o.id) AS total_orders
      FROM users u
      JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY total_spent DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const customerReport = rows.map((row) => ({
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      total_spent: row.total_spent,
      total_orders: row.total_orders,
    }));

    return customerReport;
  } catch (error) {
    console.error("Error generating customer report:", error);
    throw new Error("Failed to generate customer report");
  } finally {
    connection.release();
  }
}

// Customer reports

export async function generateCampaignPerformanceReport(): Promise<any[]> {
  const connection = await getConnection();

  try {
    const query = `
      SELECT
        c.name,
        c.startDate,
        c.endDate,
        c.budget,
        c.revenue,
        (c.revenue - c.budget) AS profit
      FROM Campaigns c
      ORDER BY c.startDate DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const campaignPerformanceReport = rows.map((row) => ({
      name: row.name,
      startDate: row.startDate,
      endDate: row.endDate,
      budget: row.budget,
      revenue: row.revenue,
      profit: row.profit,
    }));

    return campaignPerformanceReport;
  } catch (error) {
    console.error("Error generating campaign performance report:", error);
    throw new Error("Failed to generate campaign performance report");
  } finally {
    connection.release();
  }
}
