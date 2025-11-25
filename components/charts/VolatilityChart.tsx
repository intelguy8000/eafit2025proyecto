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
  ReferenceLine,
} from "recharts";
import { StoreVolatility } from "@/lib/data";

interface VolatilityChartProps {
  data: StoreVolatility[];
}

const getRiskColor = (risk: "low" | "medium" | "high"): string => {
  switch (risk) {
    case "high":
      return "#C65D3B"; // Coral
    case "medium":
      return "#D4A574"; // Amber/Yellow
    case "low":
      return "#1D6F4A"; // Green
    default:
      return "#B8C5D6";
  }
};

export function VolatilityChart({ data }: VolatilityChartProps) {
  const chartData = data.slice(0, 15).map((d) => ({
    store: `T${d.store}`,
    volatility: d.coefficientOfVariation,
    risk: d.risk,
    type: d.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `${value}%`}
          domain={[0, "dataMax + 10"]}
        />
        <YAxis
          type="category"
          dataKey="store"
          tick={{ fontSize: 11, fill: "#718096" }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number, _name, props) => [
            `${value.toFixed(1)}%`,
            `Volatilidad (Tipo ${props.payload.type})`,
          ]}
        />
        <ReferenceLine
          x={30}
          stroke="#D4A574"
          strokeDasharray="5 5"
          label={{ value: "Medio", fill: "#D4A574", fontSize: 10 }}
        />
        <ReferenceLine
          x={50}
          stroke="#C65D3B"
          strokeDasharray="5 5"
          label={{ value: "Alto", fill: "#C65D3B", fontSize: 10 }}
        />
        <Bar dataKey="volatility" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
