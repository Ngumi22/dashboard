"use server";

import { query } from "./db";
import { getConnection } from "./db";
import { mapProductRow } from "./utils";
import { RowDataPacket } from "mysql2/promise";
import { Product, ProductRow } from "./definitions";
import { getCache, setCache } from "./cache";

// BestSellingProductsReport
export async function generateBestSellingProductsReport(): Promise<Product[]> {
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
      GROUP BY p.id, p.name, p.sku, p.price, p.brand
      ORDER BY total_sold DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const bestSellingProducts = (rows as ProductRow[]).map(mapProductRow);

    return bestSellingProducts;
  } catch (error) {
    console.error("Error generating best-selling products report:", error);
    throw new Error("Failed to generate best-selling products report");
  } finally {
    connection.release();
  }
}

// Inventory Report

export async function generateInventoryReport(): Promise<Product[]> {
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

    return inventoryReport;
  } catch (error) {
    console.error("Error generating inventory report:", error);
    throw new Error("Failed to generate inventory report");
  } finally {
    connection.release();
  }
}

// Order summary report

export async function generateOrderSummaryReport(
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  const connection = await getConnection();

  try {
    let query = `
      SELECT
        COUNT(o.id) AS total_orders,
        SUM(o.total_price) AS total_revenue,
        COUNT(CASE WHEN o.status = 'Completed' THEN 1 END) AS completed_orders
      FROM orders o
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ` WHERE o.order_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    const [rows] = await connection.query<RowDataPacket[]>(query, params);
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

// Web traffic

export async function generateWebTrafficReport(): Promise<any[]> {
  const connection = await getConnection();

  try {
    const query = `
      SELECT
        wt.id AS traffic_id,
        wt.visitDate AS date,
        wt.pageViews AS page_views,
        wt.sessions,
        wt.uniqueVisitors AS unique_visitors
      FROM website_traffic wt
      ORDER BY wt.visitDate DESC
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query);
    const webTrafficReport = rows.map((row) => ({
      traffic_id: row.traffic_id,
      date: row.date,
      page_views: row.page_views,
      sessions: row.sessions,
      unique_visitors: row.unique_visitors,
    }));

    return webTrafficReport;
  } catch (error) {
    console.error("Error generating web traffic report:", error);
    throw new Error("Failed to generate web traffic report");
  } finally {
    connection.release();
  }
}

// Campaign
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

//Customers

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

// reviews
export async function generateReviewsReport(): Promise<any[]> {
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

    return reviewsReport;
  } catch (error) {
    console.error("Error generating reviews report:", error);
    throw new Error("Failed to generate reviews report");
  } finally {
    connection.release();
  }
}

//profit

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
