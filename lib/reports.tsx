"use server";

import { query } from "./db";
import { getConnection } from "./db";
import { mapProductRow } from "./utils";
import { RowDataPacket } from "mysql2/promise";
import { Product, ProductRow } from "./definitions";
import { getCache, setCache } from "./cache";
import { initialize } from "./main";

initialize();

export async function generateBestSellingProductsReport(): Promise<Product[]> {
  const cacheKey = `best_selling_products_report`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const connection = await getConnection();

  try {
    const query = `
      SELECT
        p.id AS product_id,
        p.name,
        p.sku,
        p.price,
        p.brand,
        SUM(oi.quantity) AS total_sold
      FROM product p
      JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY total_sold DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const bestSellingProducts = (rows as ProductRow[]).map(mapProductRow);

    setCache(cacheKey, bestSellingProducts);
    return bestSellingProducts;
  } catch (error) {
    console.error("Error generating best-selling products report:", error);
    throw new Error("Failed to generate best-selling products report");
  } finally {
    connection.release();
  }
}

export async function generateInventoryReport(): Promise<Product[]> {
  const cacheKey = `inventory_report`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const connection = await getConnection();

  try {
    const query = `
      SELECT
        p.id AS product_id,
        p.name,
        p.sku,
        p.quantity,
        i.stock_level
      FROM product p
      JOIN inventory i ON p.id = i.product_id
      ORDER BY i.stock_level ASC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const inventoryReport = (rows as ProductRow[]).map(mapProductRow);

    setCache(cacheKey, inventoryReport);
    return inventoryReport;
  } catch (error) {
    console.error("Error generating inventory report:", error);
    throw new Error("Failed to generate inventory report");
  } finally {
    connection.release();
  }
}

// This function now accepts optional start and end dates to filter orders by a custom date range
export async function generateOrderSummaryReport(): Promise<any[]> {
  const connection = await getConnection();

  try {
    const query = `
      SELECT
        COUNT(o.id) AS total_orders,
        SUM(o.total_price) AS total_revenue,
        COUNT(CASE WHEN o.status = 'Completed' THEN 1 END) AS completed_orders
      FROM orders o
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const summary = rows.length
      ? rows[0]
      : { total_orders: 0, total_revenue: 0, completed_orders: 0 };

    return [summary];
  } catch (error) {
    console.error("Error generating order summary report:", error);
    throw new Error("Failed to generate order summary report");
  } finally {
    connection.release();
  }
}

export async function generateWebTrafficReport(): Promise<any[]> {
  const cacheKey = `web_traffic_report`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const connection = await getConnection();

  try {
    const query = `
      SELECT
        wt.id AS traffic_id,
        wt.date,
        wt.visitors,
        wt.page_views,
        wt.bounce_rate
      FROM website_traffic wt
      ORDER BY wt.date DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const webTrafficReport = rows.map((row) => ({
      traffic_id: row.traffic_id,
      date: row.date,
      visitors: row.visitors,
      page_views: row.page_views,
      bounce_rate: row.bounce_rate,
    }));

    setCache(cacheKey, webTrafficReport);
    return webTrafficReport;
  } catch (error) {
    console.error("Error generating web traffic report:", error);
    throw new Error("Failed to generate web traffic report");
  } finally {
    connection.release();
  }
}

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
