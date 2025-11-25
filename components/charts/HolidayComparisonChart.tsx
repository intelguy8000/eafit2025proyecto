"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WeeklyAggregation } from "@/lib/data";

interface HolidayComparisonChartProps {
  data: WeeklyAggregation[];
}

export function HolidayComparisonChart({ data }: HolidayComparisonChartProps) {
  // Calculate averages for holiday vs non-holiday
  const holidayWeeks = data.filter((d) => d.isHoliday);
  const nonHolidayWeeks = data.filter((d) => !d.isHoliday);

  const avgHoliday =
    holidayWeeks.reduce((sum, d) => sum + d.totalSales, 0) / holidayWeeks.length;
  const avgNonHoliday =
    nonHolidayWeeks.reduce((sum, d) => sum + d.totalSales, 0) / nonHolidayWeeks.length;

  // Also calculate per-store averages
  const avgHolidayPerStore =
    holidayWeeks.reduce((sum, d) => sum + d.avgSalesPerStore, 0) / holidayWeeks.length;
  const avgNonHolidayPerStore =
    nonHolidayWeeks.reduce((sum, d) => sum + d.avgSalesPerStore, 0) /
    nonHolidayWeeks.length;

  const chartData = [
    {
      category: "Ventas Totales",
      Festivo: avgHoliday / 1_000_000,
      Normal: avgNonHoliday / 1_000_000,
    },
    {
      category: "Por Tienda",
      Festivo: avgHolidayPerStore / 1_000_000,
      Normal: avgNonHolidayPerStore / 1_000_000,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#718096" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "#718096" }}
          tickFormatter={(value) => `$${value.toFixed(1)}M`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="Festivo" fill="#D5F0E3" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Normal" fill="#7B9ACC" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
