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
  ReferenceLine,
} from "recharts";

interface ForecastChartProps {
  data: Array<{
    date: string;
    actual?: number;
    predicted?: number;
    lowerBound?: number;
    upperBound?: number;
    isHoliday: boolean;
  }>;
}

export function ForecastChart({ data }: ForecastChartProps) {
  // Find the transition point between actual and predicted
  const transitionIndex = data.findIndex(d => d.predicted !== undefined && d.actual === undefined);
  const transitionDate = transitionIndex > 0 ? data[transitionIndex].date : null;

  // Transform data for the confidence band
  const chartData = data.map(d => ({
    ...d,
    actualMillions: d.actual ? d.actual / 1_000_000 : undefined,
    predictedMillions: d.predicted ? d.predicted / 1_000_000 : undefined,
    lowerBoundMillions: d.lowerBound ? d.lowerBound / 1_000_000 : undefined,
    upperBoundMillions: d.upperBound ? d.upperBound / 1_000_000 : undefined,
    confidenceBand: d.lowerBound && d.upperBound
      ? [d.lowerBound / 1_000_000, d.upperBound / 1_000_000]
      : undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7B9ACC" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7B9ACC" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6BCB77" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6BCB77" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          interval={Math.floor(chartData.length / 10)}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#718096" }}
          tickFormatter={(value) => `$${value.toFixed(0)}M`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value, name) => {
            if (value === undefined || value === null) return ["-", name];
            const numValue = Number(value);
            const label = name === "actualMillions" ? "Ventas Reales"
              : name === "predictedMillions" ? "Predicción"
              : name === "lowerBoundMillions" ? "Límite Inferior"
              : name === "upperBoundMillions" ? "Límite Superior"
              : String(name);
            return [`$${numValue.toFixed(2)}M`, label];
          }}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleDateString('es-ES', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => {
            if (value === "actualMillions") return "Ventas Reales";
            if (value === "predictedMillions") return "Predicción";
            if (value === "upperBoundMillions") return "Banda de Confianza";
            return value;
          }}
        />

        {/* Reference line at transition point */}
        {transitionDate && (
          <ReferenceLine
            x={transitionDate}
            stroke="#9CA3AF"
            strokeDasharray="5 5"
            label={{
              value: "Inicio Predicción",
              position: "top",
              fontSize: 10,
              fill: "#9CA3AF"
            }}
          />
        )}

        {/* Confidence band (area between lower and upper) */}
        <Area
          type="monotone"
          dataKey="upperBoundMillions"
          stroke="none"
          fill="#6BCB77"
          fillOpacity={0.15}
          name="upperBoundMillions"
        />
        <Area
          type="monotone"
          dataKey="lowerBoundMillions"
          stroke="none"
          fill="#FAFBFF"
          fillOpacity={1}
          name="lowerBoundMillions"
          legendType="none"
        />

        {/* Actual sales line */}
        <Area
          type="monotone"
          dataKey="actualMillions"
          stroke="#7B9ACC"
          strokeWidth={2}
          fill="url(#actualGradient)"
          name="actualMillions"
          connectNulls={false}
        />

        {/* Predicted sales line (dashed) */}
        <Line
          type="monotone"
          dataKey="predictedMillions"
          stroke="#6BCB77"
          strokeWidth={2}
          strokeDasharray="8 4"
          dot={{ fill: "#6BCB77", strokeWidth: 0, r: 3 }}
          name="predictedMillions"
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
