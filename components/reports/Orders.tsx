"use client";
import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { generateOrderSummaryReport } from "@/lib/reports";

export default function OrdersCard() {
  const [orderSummary, setOrderSummary] = useState<{
    total_orders: number;
    total_revenue: number;
    completed_orders: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOrderSummary() {
      try {
        setLoading(true);
        const [summary] = await generateOrderSummaryReport();
        setOrderSummary(summary);
      } catch (error) {
        console.error("Failed to fetch order summary report", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderSummary();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!orderSummary) {
    return <div>No data available</div>;
  }

  return (
    <Card x-chunk="dashboard-01-chunk-2" className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Orders Completed</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">+12,234</div>
        <p className="text-xs text-muted-foreground">+19% from last month</p>
      </CardContent>
    </Card>
  );
}
