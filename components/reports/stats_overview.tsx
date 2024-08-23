import React from "react";
import { Card } from "../ui/card";
import TotalOrders from "./total_orders";
import TotalVisit from "./total_visits";
import SalesCard from "./SalesCard";
import TotalRevenue from "./total_revenue";
import RecentSales from "./recent_sales";

export default function StatsOverview() {
  return (
    <Card className="h-full p-2 space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <TotalOrders />
        <TotalVisit />
        <SalesCard />
        <TotalRevenue />
      </div>

      <RecentSales />
    </Card>
  );
}
