"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { WeeklyWithFeatures } from "@/lib/data";

interface UnemploymentScatterChartProps {
  data: WeeklyWithFeatures[];
}

export function UnemploymentScatterChart({ data }: UnemploymentScatterChartProps) {
  const chartData = data.map((d) => ({
    unemployment: d.avgUnemployment,
    sales: d.totalSales / 1_000_000,
    isHoliday: d.isHoliday,
  }));

  const holidayData = chartData.filter((d) => d.isHoliday);
  const normalData = chartData.filter((d) => !d.isHoliday);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="unemployment"
          type="number"
          name="Desempleo"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `${value}%`}
          domain={["dataMin - 0.5", "dataMax + 0.5"]}
        />
        <YAxis
          dataKey="sales"
          type="number"
          name="Ventas"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `$${value}M`}
          width={50}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [
            name === "Ventas" ? `$${value.toFixed(2)}M` : `${value.toFixed(2)}%`,
            name,
          ]}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Scatter
          name="Semanas normales"
          data={normalData}
          fill="#7B9ACC"
          fillOpacity={0.6}
        />
        <Scatter
          name="Semanas festivas"
          data={holidayData}
          fill="#D5F0E3"
          fillOpacity={0.8}
          shape="diamond"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
