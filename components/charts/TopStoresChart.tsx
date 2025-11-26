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
import { StoreAggregation } from "@/lib/data";

interface TopStoresChartProps {
  data: StoreAggregation[];
}

const typeColors: Record<string, string> = {
  A: "#5B7FC2", // Azul más saturado para Tipo A
  B: "#9BAFCA", // Gris azulado para Tipo B
  C: "#C4A8D4", // Lavanda para Tipo C
};

export function TopStoresChart({ data }: TopStoresChartProps) {
  const chartData = data.slice(0, 10).map((d) => ({
    store: `Tienda ${d.store}`,
    sales: d.totalSales / 1_000_000,
    type: d.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#718096" }}
          tickFormatter={(value) => `$${value}M`}
        />
        <YAxis
          type="category"
          dataKey="store"
          tick={{ fontSize: 11, fill: "#718096" }}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number, _name, props) => [
            `$${value.toFixed(2)}M`,
            `Tipo ${props.payload.type}`,
          ]}
        />
        <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={typeColors[entry.type] || "#7B9ACC"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
