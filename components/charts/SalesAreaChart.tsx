"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WeeklyAggregation } from "@/lib/data";

interface SalesAreaChartProps {
  data: WeeklyAggregation[];
}

export function SalesAreaChart({ data }: SalesAreaChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    sales: d.totalSales / 1_000_000, // Convert to millions
    isHoliday: d.isHoliday,
  }));

  const holidayWeeks = chartData.filter((d) => d.isHoliday);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7B9ACC" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7B9ACC" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#718096" }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
          }}
          interval={10}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#718096" }}
          tickFormatter={(value) => `$${value}M`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}M`, "Ventas"]}
          labelFormatter={(label) => {
            const item = chartData.find((d) => d.date === label);
            return `${label}${item?.isHoliday ? " (Festivo)" : ""}`;
          }}
        />
        {holidayWeeks.map((week) => (
          <ReferenceLine
            key={week.date}
            x={week.date}
            stroke="#D5F0E3"
            strokeWidth={8}
            strokeOpacity={0.6}
          />
        ))}
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#7B9ACC"
          strokeWidth={2}
          fill="url(#salesGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
