import React from "react";
import { CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function TotalVisit() {
  return (
    <Card x-chunk="dashboard-01-chunk-2" className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Visists</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">+12,234</div>
        <p className="text-xs text-muted-foreground">+19% from last month</p>
      </CardContent>
    </Card>
  );
}
