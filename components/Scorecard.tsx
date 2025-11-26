"use client";

import { LucideIcon } from "lucide-react";

type ScorecardVariant = "blue" | "lavender" | "coral" | "green";

interface ScorecardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant: ScorecardVariant;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantStyles: Record<ScorecardVariant, string> = {
  blue: "scorecard scorecard-blue",
  lavender: "scorecard scorecard-lavender",
  coral: "scorecard scorecard-coral",
  green: "scorecard scorecard-green",
};

export function Scorecard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  trend,
}: ScorecardProps) {
  return (
    <div className={variantStyles[variant]}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-70">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.isPositive ? "text-green-600" : "text-red-500"}`}>
              {trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}% vs periodo anterior
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-white/30">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
