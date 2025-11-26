"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Scorecard } from "@/components/Scorecard";
import { Tabs } from "@/components/Tabs";
import {
  SalesAreaChart,
  TopStoresChart,
  DepartmentPieChart,
  HolidayComparisonChart,
  SalesTemperatureChart,
  SalesFuelChart,
  UnemploymentScatterChart,
  SeasonalityChart,
  AnomalyTrendChart,
  VolatilityChart,
} from "@/components/charts";
import { ScalingPlan } from "@/components/ScalingPlan";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Loader2,
  BarChart3,
  Settings,
  Thermometer,
  Fuel,
  Store,
  Trophy,
  ShieldAlert,
  TrendingDown,
  Activity,
  Rocket,
} from "lucide-react";
import {
  KPIs,
  StoreAggregation,
  DepartmentAggregation,
  WeeklyAggregation,
  StoreVolatility,
  WeeklyWithFeatures,
  StoreTypePerformance,
  TopWeek,
  MonthlySales,
  Anomaly,
  WeekOverWeekAlert,
  WeeklyWithAnomalyFlag,
  formatCurrency,
  formatNumber,
} from "@/lib/data";

interface RiskCounts {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

interface DashboardData {
  kpis: KPIs;
  storeAggregations: StoreAggregation[];
  departmentAggregations: DepartmentAggregation[];
  weeklyAggregations: WeeklyAggregation[];
  volatility: StoreVolatility[];
  riskCounts: RiskCounts;
  weeklyWithFeatures: WeeklyWithFeatures[];
  storeTypePerformance: StoreTypePerformance[];
  topWeeks: TopWeek[];
  monthlySales: MonthlySales[];
  anomalies: Anomaly[];
  weekOverWeekAlerts: WeekOverWeekAlert[];
  weeklyWithAnomalies: WeeklyWithAnomalyFlag[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("financiero");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/data", {
          cache: "no-store",
        });

        const text = await response.text();

        if (!response.ok) {
          let errorMsg = "Failed to load data";
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.error || errorMsg;
          } catch {
            errorMsg = text || errorMsg;
          }
          throw new Error(errorMsg);
        }

        const dashboardData = JSON.parse(text);

        if (dashboardData.error) {
          throw new Error(dashboardData.error);
        }

        setData(dashboardData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-text-primary font-medium">Cargando datos de Walmart...</p>
              <p className="text-sm text-text-muted mt-1">Procesando 421K registros</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col">
        <Header />
        <div className="flex-1 p-6">
          <div className="card p-6 border-l-4 border-l-[#C65D3B]">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Error al cargar datos
            </h3>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  const {
    kpis,
    storeAggregations,
    departmentAggregations,
    weeklyAggregations,
    volatility,
    riskCounts,
    weeklyWithFeatures,
    storeTypePerformance,
    topWeeks,
    monthlySales,
    anomalies,
    weekOverWeekAlerts,
    weeklyWithAnomalies,
  } = data;

  const highRiskStores = riskCounts.highRisk;
  const mediumRiskStores = riskCounts.mediumRisk;
  const lowRiskStores = riskCounts.lowRisk;
  const totalAnomalies = anomalies.length;

  const tabs = [
    { id: "financiero", label: "Financiero", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "operativo", label: "Operativo", icon: <Settings className="w-4 h-4" /> },
    { id: "riesgos", label: "Riesgos", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "escalado", label: "Plan de Escalado", icon: <Rocket className="w-4 h-4" /> },
  ];

  // Calculate values for scaling plan
  const typeAPerf = storeTypePerformance.find((p) => p.type === "A");
  const typeBCPerf = storeTypePerformance.filter((p) => p.type !== "A");
  const typeAAvgSales = typeAPerf?.avgSalesPerStore || 0;
  const typeBCAvgSales =
    typeBCPerf.length > 0
      ? typeBCPerf.reduce((sum, p) => sum + p.avgSalesPerStore, 0) / typeBCPerf.length
      : 0;

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 max-w-[1920px] mx-auto w-full">
        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === "financiero" && (
          <>
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
          </>
        )}

        {activeTab === "operativo" && (
          <>
            {/* Store Type Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {storeTypePerformance.map((perf) => (
                <div
                  key={perf.type}
                  className={`card p-5 border-l-4 ${
                    perf.type === "A"
                      ? "border-l-[#7B9ACC]"
                      : perf.type === "B"
                      ? "border-l-[#B8C5D6]"
                      : "border-l-[#E8D5F2]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-text-muted" />
                      <span className="text-lg font-semibold text-text-primary">
                        Tipo {perf.type}
                      </span>
                    </div>
                    <span className="text-xs bg-secondary/30 px-2 py-1 rounded text-text-muted">
                      {perf.storeCount} tiendas
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Ventas totales</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatCurrency(perf.totalSales)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Promedio/tienda</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatCurrency(perf.avgSalesPerStore)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Tamaño prom.</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatNumber(perf.avgSize)} sqft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">Volatilidad</span>
                      <span
                        className={`text-sm font-medium ${
                          perf.avgVolatility > 25
                            ? "text-scorecard-coral-text"
                            : perf.avgVolatility > 15
                            ? "text-scorecard-lavender-text"
                            : "text-scorecard-green-text"
                        }`}
                      >
                        {perf.avgVolatility.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* External Factors Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Thermometer className="w-5 h-5 text-scorecard-coral-text" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Ventas vs Temperatura
                  </h3>
                </div>
                <p className="text-xs text-text-muted mb-4">
                  Correlación entre temperatura promedio y ventas semanales
                </p>
                <SalesTemperatureChart data={weeklyWithFeatures} />
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Fuel className="w-5 h-5 text-scorecard-lavender-text" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Ventas vs Precio Gasolina
                  </h3>
                </div>
                <p className="text-xs text-text-muted mb-4">
                  Impacto del precio del combustible en las ventas
                </p>
                <SalesFuelChart data={weeklyWithFeatures} />
              </div>
            </div>

            {/* Unemployment and Seasonality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Impacto del Desempleo
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Dispersión de ventas por tasa de desempleo (diamantes = festivos)
                </p>
                <UnemploymentScatterChart data={weeklyWithFeatures} />
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Estacionalidad Mensual
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Promedio de ventas semanales por mes del año
                </p>
                <SeasonalityChart data={monthlySales} />
              </div>
            </div>

            {/* Top 5 Weeks */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-scorecard-green-text" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Top 5 Semanas con Mayor Ventas
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Ventas Totales</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWeeks.map((week) => (
                      <tr key={week.date} className="border-b border-border/50 hover:bg-secondary/10">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-scorecard-blue-bg text-scorecard-blue-text text-sm font-medium">
                            {week.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary font-medium">
                          {week.date}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {formatCurrency(week.totalSales)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              week.isHoliday
                                ? "bg-scorecard-green-bg text-scorecard-green-text"
                                : "bg-secondary/30 text-text-muted"
                            }`}
                          >
                            {week.isHoliday ? "Festivo" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "riesgos" && (
          <>
            {/* Risk Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Scorecard
                title="Alto Riesgo"
                value={highRiskStores}
                subtitle="Tiendas con volatilidad >50%"
                icon={AlertTriangle}
                variant="coral"
              />
              <Scorecard
                title="Riesgo Medio"
                value={mediumRiskStores}
                subtitle="Volatilidad 30-50%"
                icon={Activity}
                variant="lavender"
              />
              <Scorecard
                title="Bajo Riesgo"
                value={lowRiskStores}
                subtitle="Volatilidad <30%"
                icon={ShieldAlert}
                variant="green"
              />
              <Scorecard
                title="Anomalías Detectadas"
                value={totalAnomalies}
                subtitle="Registros fuera del IQR"
                icon={TrendingDown}
                variant="blue"
              />
            </div>

            {/* Anomaly Trend Chart */}
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-scorecard-coral-text" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Tendencia con Anomalías Marcadas
                </h3>
              </div>
              <p className="text-xs text-text-muted mb-4">
                Los puntos rojos indican semanas con más de 5 anomalías detectadas (método IQR)
              </p>
              <AnomalyTrendChart data={weeklyWithAnomalies} />
            </div>

            {/* Volatility Chart and Top Anomalies Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Top 15 Tiendas Más Volátiles
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Coeficiente de variación (CV): rojo &gt;50%, amarillo 30-50%, verde &lt;30%
                </p>
                <VolatilityChart data={volatility} />
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Top 10 Registros Anómalos
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Ventas fuera del rango intercuartil (Q1-1.5*IQR a Q3+1.5*IQR)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Fecha</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Tienda</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Dept</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Ventas</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-text-muted">Desv.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.slice(0, 10).map((anomaly, idx) => (
                        <tr key={`${anomaly.store}-${anomaly.dept}-${anomaly.date}-${idx}`} className="border-b border-border/50">
                          <td className="py-2 px-3 text-xs text-text-primary">{anomaly.date}</td>
                          <td className="py-2 px-3 text-xs text-text-primary">T{anomaly.store}</td>
                          <td className="py-2 px-3 text-xs text-text-muted">{anomaly.dept}</td>
                          <td className="py-2 px-3 text-xs text-text-primary">
                            {formatCurrency(anomaly.sales)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                anomaly.type === "high"
                                  ? "bg-scorecard-green-bg text-scorecard-green-text"
                                  : "bg-scorecard-coral-bg text-scorecard-coral-text"
                              }`}
                            >
                              {anomaly.type === "high" ? "+" : "-"}{anomaly.deviation.toFixed(1)} IQR
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Week Over Week Alerts */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-scorecard-coral-text" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Alertas de Caídas Semanales (&gt;20%)
                </h3>
              </div>
              <p className="text-xs text-text-muted mb-4">
                Tiendas con caída de ventas mayor al 20% semana a semana
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {weekOverWeekAlerts.slice(0, 15).map((alert, idx) => (
                  <div
                    key={`${alert.store}-${alert.date}-${idx}`}
                    className="flex items-center gap-3 p-3 bg-scorecard-coral-bg/30 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-scorecard-coral-text flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">
                        <span className="font-medium">Tienda {alert.store}</span> cayó{" "}
                        <span className="font-bold text-scorecard-coral-text">
                          {alert.changePercent.toFixed(1)}%
                        </span>{" "}
                        en semana {alert.date}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatCurrency(alert.previousSales)} → {formatCurrency(alert.currentSales)}
                      </p>
                    </div>
                  </div>
                ))}
                {weekOverWeekAlerts.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-4">
                    No hay alertas de caídas mayores al 20%
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "escalado" && (
          <ScalingPlan
            holidayImpact={kpis.holidayImpact.percentageDiff}
            highRiskStores={highRiskStores}
            typeAAvgSales={typeAAvgSales}
            typeBCAvgSales={typeBCAvgSales}
            totalSales={kpis.totalSales}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
