"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Scorecard } from "@/components/Scorecard";
import {
  SalesAreaChart,
  TopStoresChart,
  DepartmentPieChart,
  HolidayComparisonChart,
} from "@/components/charts";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  KPIs,
  StoreAggregation,
  DepartmentAggregation,
  WeeklyAggregation,
  StoreVolatility,
  formatCurrency,
  formatNumber,
} from "@/lib/data";

interface DashboardData {
  kpis: KPIs;
  storeAggregations: StoreAggregation[];
  departmentAggregations: DepartmentAggregation[];
  weeklyAggregations: WeeklyAggregation[];
  volatility: StoreVolatility[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/data");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load data");
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-text-muted">Cargando datos de Walmart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-page">
        <Header />
        <div className="p-6">
          <div className="card p-6 border-l-4 border-l-[#C65D3B]">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Error al cargar datos
            </h3>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <div className="bg-scorecard-coral-bg/50 p-4 rounded-lg">
              <p className="text-sm text-scorecard-coral-text mb-2">
                Asegúrate de tener los archivos CSV en la carpeta <code className="bg-white/50 px-2 py-1 rounded">data/</code>:
              </p>
              <ul className="text-sm text-scorecard-coral-text space-y-1">
                <li>• train.csv</li>
                <li>• features.csv</li>
                <li>• stores.csv</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, storeAggregations, departmentAggregations, weeklyAggregations, volatility } = data;
  const highRiskStores = volatility.filter((v) => v.risk === "high").length;

  return (
    <div className="min-h-screen bg-bg-page">
      <Header />

      <main className="p-6">
        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Scorecard
            title="Ventas Totales"
            value={formatCurrency(kpis.totalSales)}
            subtitle={`${kpis.dateRange.start} - ${kpis.dateRange.end}`}
            icon={DollarSign}
            variant="blue"
          />
          <Scorecard
            title="Promedio Semanal"
            value={formatCurrency(kpis.weeklyAverage)}
            subtitle={`${formatNumber(kpis.totalTransactions)} registros`}
            icon={TrendingUp}
            variant="lavender"
          />
          <Scorecard
            title="Impacto Festivos"
            value={`${kpis.holidayImpact.percentageDiff >= 0 ? "+" : ""}${kpis.holidayImpact.percentageDiff.toFixed(1)}%`}
            subtitle="vs semanas normales"
            icon={Calendar}
            variant="green"
            trend={{
              value: kpis.holidayImpact.percentageDiff,
              isPositive: kpis.holidayImpact.percentageDiff > 0,
            }}
          />
          <Scorecard
            title="Tiendas en Riesgo"
            value={highRiskStores}
            subtitle={`de ${kpis.uniqueStores} tiendas (alta volatilidad)`}
            icon={AlertTriangle}
            variant="coral"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Tendencia de Ventas Semanal
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Las barras verdes indican semanas festivas
            </p>
            <SalesAreaChart data={weeklyAggregations} />
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Top 10 Tiendas por Ventas
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Color por tipo: A (azul), B (gris), C (lavanda)
            </p>
            <TopStoresChart data={storeAggregations} />
          </div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Ventas por Departamento
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Top 8 departamentos + otros
            </p>
            <DepartmentPieChart data={departmentAggregations} />
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Festivos vs Semanas Normales
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Promedio de ventas por tipo de semana
            </p>
            <HolidayComparisonChart data={weeklyAggregations} />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-sm text-text-muted">Tiendas Analizadas</p>
            <p className="text-2xl font-bold text-text-primary">{kpis.uniqueStores}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-text-muted">Departamentos</p>
            <p className="text-2xl font-bold text-text-primary">{kpis.uniqueDepartments}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-text-muted">Total Markdowns</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(kpis.totalMarkdown)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
