import { NextResponse } from "next/server";
import { getConnectionPoolMetrics, initDbConnection } from "@/lib/db";

export async function GET() {
  try {
    // Ensure the database pool is initialized
    await initDbConnection();

    // Fetch the metrics
    const metrics = getConnectionPoolMetrics();

    // Handle potential errors from getConnectionPoolMetrics
    if (metrics.error) {
      console.error(metrics.error);
      return NextResponse.json({ error: metrics.error }, { status: 500 });
    }

    console.log("Metrics successfully retrieved:", metrics);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Error fetching metrics" },
      { status: 500 }
    );
  }
}
