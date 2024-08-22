"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for time frames
type TimeFrame = "days" | "months" | "years";

// Sample data for different time frames
const chartData = {
  months: [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
    { month: "July", desktop: 314, mobile: 140 },
  ],
  days: [
    { day: "Monday", desktop: 50, mobile: 20 },
    { day: "Tuesday", desktop: 70, mobile: 40 },
    { day: "Wednesday", desktop: 90, mobile: 60 },
    { day: "Thursday", desktop: 110, mobile: 80 },
    { day: "Friday", desktop: 130, mobile: 100 },
    { day: "Saturday", desktop: 150, mobile: 120 },
    { day: "Sunday", desktop: 170, mobile: 140 },
  ],
  years: [
    { year: "2020", desktop: 1000, mobile: 500 },
    { year: "2021", desktop: 1500, mobile: 800 },
    { year: "2022", desktop: 2000, mobile: 1200 },
    { year: "2023", desktop: 2500, mobile: 1500 },
    { year: "2024", desktop: 3000, mobile: 1800 },
  ],
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export default function OrdersChart() {
  // Use the defined TimeFrame type
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>("months");

  // Access the correct data based on time frame
  const dataKey =
    timeFrame === "months" ? "month" : timeFrame === "days" ? "day" : "year";
  const data = chartData[timeFrame];

  return (
    <Card className="w-full">
      <CardHeader className="w-64 ml-auto">
        <Select
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
          <SelectTrigger
            className="mb-4 h-7 rounded-lg"
            aria-label="Select a time frame">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="months">Months</SelectItem>
            <SelectItem value="years">Years</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <ChartContainer
        config={chartConfig}
        className="w-full max-h-[16rem] h-auto">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={dataKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) =>
              timeFrame === "months" ? value.slice(0, 3) : value
            }
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
