import React from "react";
import { GetServerSideProps } from "next";
import { generateRevenueAndProfitReport } from "@/lib/reports"; // Function to fetch the revenue and profit data from the database

interface RevenueAndProfit {
  total_revenue: number;
  total_cogs: number;
  total_profit: number;
  profit_margin: number;
}

interface RevenueAndProfitReportProps {
  report: RevenueAndProfit;
}

export default function RevenueAndProfitReport({
  report,
}: RevenueAndProfitReportProps) {
  return (
    <div>
      <h2>Revenue and Profit</h2>
      <p>Total Revenue: ${report.total_revenue.toFixed(2)}</p>
      <p>Total Cost of Goods Sold: ${report.total_cogs.toFixed(2)}</p>
      <p>Total Profit: ${report.total_profit.toFixed(2)}</p>
      <p>Profit Margin: {report.profit_margin.toFixed(2)}%</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const report = await generateRevenueAndProfitReport(); // Fetch the data directly from the database
  return {
    props: {
      report,
    },
  };
};
