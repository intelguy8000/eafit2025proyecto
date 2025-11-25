"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WeeklyWithFeatures } from "@/lib/data";

interface SalesTemperatureChartProps {
  data: WeeklyWithFeatures[];
}

export function SalesTemperatureChart({ data }: SalesTemperatureChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    sales: d.totalSales / 1_000_000,
    temperature: d.avgTemperature,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesTempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7B9ACC" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7B9ACC" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
          }}
          interval={12}
        />
        <YAxis
          yAxisId="sales"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `$${value}M`}
          width={50}
        />
        <YAxis
          yAxisId="temp"
          orientation="right"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `${value}°F`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [
            name === "sales" ? `$${value.toFixed(2)}M` : `${value.toFixed(1)}°F`,
            name === "sales" ? "Ventas" : "Temperatura",
          ]}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Area
          yAxisId="sales"
          type="monotone"
          dataKey="sales"
          stroke="#7B9ACC"
          strokeWidth={2}
          fill="url(#salesTempGradient)"
          name="Ventas"
        />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="temperature"
          stroke="#FFE4D6"
          strokeWidth={2}
          dot={false}
          name="Temperatura"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
