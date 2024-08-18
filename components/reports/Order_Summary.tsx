import React from "react";
import { GetServerSideProps } from "next";
import { generateOrderSummaryReport } from "@/lib/reports"; // Function to fetch the order summary data from the database

interface OrderSummary {
  total_orders: number;
  total_revenue: number;
  completed_orders: number;
}

interface OrderSummaryReportProps {
  summary: OrderSummary;
}

export default function OrderSummaryReport({
  summary,
}: OrderSummaryReportProps) {
  return (
    <div>
      <h2>Order Summary</h2>
      <p>Total Orders: {summary.total_orders}</p>
      <p>Total Revenue: ${summary.total_revenue.toFixed(2)}</p>
      <p>Completed Orders: {summary.completed_orders}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const summary = await generateOrderSummaryReport(); // Fetch the data directly from the database
  return {
    props: {
      summary,
    },
  };
};
