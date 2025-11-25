"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DepartmentAggregation } from "@/lib/data";

interface DepartmentPieChartProps {
  data: DepartmentAggregation[];
}

const COLORS = [
  "#7B9ACC",
  "#B8C5D6",
  "#E8D5F2",
  "#D5F0E3",
  "#FFE4D6",
  "#D4E5F7",
  "#F0E6D3",
  "#E0E8F0",
  "#D8E0E8",
  "#C5D0DC",
];

export function DepartmentPieChart({ data }: DepartmentPieChartProps) {
  const top8 = data.slice(0, 8);
  const others = data.slice(8);
  const othersTotal = others.reduce((sum, d) => sum + d.totalSales, 0);

  const chartData = [
    ...top8.map((d) => ({
      name: `Dept ${d.dept}`,
      value: d.totalSales / 1_000_000,
    })),
    ...(othersTotal > 0
      ? [{ name: "Otros", value: othersTotal / 1_000_000 }]
      : []),
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${value.toFixed(1)}M`, "Ventas"]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconSize={10}
          wrapperStyle={{ fontSize: "11px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
