"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MonthlySales } from "@/lib/data";

interface SeasonalityChartProps {
  data: MonthlySales[];
}

// Index 1-12 for months (Jan=1, Dec=12)
const MONTH_COLORS: Record<number, string> = {
  1: "#D4E5F7",  // Jan - winter (light blue)
  2: "#D4E5F7",  // Feb - winter
  3: "#D5F0E3",  // Mar - spring (light green)
  4: "#D5F0E3",  // Apr - spring
  5: "#D5F0E3",  // May - spring
  6: "#FFE4D6",  // Jun - summer (light coral)
  7: "#FFE4D6",  // Jul - summer
  8: "#FFE4D6",  // Aug - summer
  9: "#E8D5F2",  // Sep - fall (light lavender)
  10: "#E8D5F2", // Oct - fall
  11: "#E8D5F2", // Nov - fall
  12: "#A8C5E2", // Dec - winter (darker blue for holiday season)
};

export function SeasonalityChart({ data }: SeasonalityChartProps) {
  const chartData = data.map((d) => ({
    month: d.monthName,
    avgSales: d.avgSales / 1_000_000,
    monthIndex: d.month,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#718096" }} />
        <YAxis
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `$${value}M`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}M`, "Promedio semanal"]}
        />
        <Bar dataKey="avgSales" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={MONTH_COLORS[entry.monthIndex] || "#D4E5F7"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
