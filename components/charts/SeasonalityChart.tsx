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

const MONTH_COLORS = [
  "#D4E5F7", // Jan - winter
  "#D4E5F7", // Feb - winter
  "#D5F0E3", // Mar - spring
  "#D5F0E3", // Apr - spring
  "#D5F0E3", // May - spring
  "#FFE4D6", // Jun - summer
  "#FFE4D6", // Jul - summer
  "#FFE4D6", // Aug - summer
  "#E8D5F2", // Sep - fall
  "#E8D5F2", // Oct - fall
  "#E8D5F2", // Nov - fall
  "#D4E5F7", // Dec - winter
];

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
            <Cell key={`cell-${index}`} fill={MONTH_COLORS[entry.monthIndex]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
