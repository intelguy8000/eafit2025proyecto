"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { WeeklyWithAnomalyFlag } from "@/lib/data";

interface AnomalyTrendChartProps {
  data: WeeklyWithAnomalyFlag[];
}

export function AnomalyTrendChart({ data }: AnomalyTrendChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    sales: d.totalSales / 1_000_000,
    isAnomaly: d.isAnomaly,
    anomalyType: d.anomalyType,
    anomalyCount: d.anomalyCount,
    // For scatter plot - only show if anomaly
    anomalySales: d.isAnomaly ? d.totalSales / 1_000_000 : null,
  }));

  const anomalyPoints = chartData.filter((d) => d.isAnomaly);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
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
          interval={10}
        />
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
          formatter={(value: number, name: string) => {
            if (name === "anomalySales") {
              return [`$${value?.toFixed(2)}M`, "Anomalía"];
            }
            return [`$${value.toFixed(2)}M`, "Ventas"];
          }}
          labelFormatter={(label) => {
            const item = chartData.find((d) => d.date === label);
            if (item?.isAnomaly) {
              return `${label} - ${item.anomalyCount} anomalías detectadas`;
            }
            return label;
          }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#7B9ACC"
          strokeWidth={2}
          fill="url(#anomalyGradient)"
          name="Ventas"
        />
        <Scatter
          dataKey="anomalySales"
          data={anomalyPoints}
          fill="#C65D3B"
          name="anomalySales"
          shape={(props: { cx?: number; cy?: number; payload?: { anomalyType: string } }) => {
            const { cx, cy, payload } = props;
            if (!cx || !cy) return null;
            const color = payload?.anomalyType === "high" ? "#C65D3B" : "#E53E3E";
            return (
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
