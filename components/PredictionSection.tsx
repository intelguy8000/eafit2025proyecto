"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  BarChart3,
  Info,
  CheckCircle2,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { ForecastChart } from "./charts/ForecastChart";
import {
  ForecastOutput,
  PredictionResult,
  prepareChartData,
  WeeklyDataPoint,
} from "@/lib/prediction";
import { formatCurrency } from "@/lib/data";

interface PredictionSectionProps {
  forecast: ForecastOutput;
  historicalData: WeeklyDataPoint[];
}

export function PredictionSection({ forecast, historicalData }: PredictionSectionProps) {
  const { predictions, metrics, methodology, summary } = forecast;
  const chartData = prepareChartData(historicalData, predictions, 52);

  const TrendIcon = summary.trend === "up" ? TrendingUp
    : summary.trend === "down" ? TrendingDown
    : Minus;

  const trendColor = summary.trend === "up" ? "text-scorecard-green-text"
    : summary.trend === "down" ? "text-scorecard-coral-text"
    : "text-text-muted";

  const trendBg = summary.trend === "up" ? "bg-scorecard-green-bg"
    : summary.trend === "down" ? "bg-scorecard-coral-bg"
    : "bg-secondary/20";

  const trendLabel = summary.trend === "up" ? "Crecimiento"
    : summary.trend === "down" ? "Caída"
    : "Estable";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 bg-gradient-to-r from-scorecard-green-bg/50 to-scorecard-blue-bg/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/50 rounded-xl">
            <Brain className="w-8 h-8 text-scorecard-green-text" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Modelo Predictivo de Ventas
            </h2>
            <p className="text-sm text-text-secondary">
              Pronóstico de ventas para las próximas 12 semanas basado en análisis de
              {" "}{methodology.dataPoints} semanas de datos históricos con estacionalidad y tendencia.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Month Prediction */}
        <div className="scorecard scorecard-green">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Ventas Próximo Mes</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(summary.nextMonthSales)}
              </p>
              <p className="text-xs mt-1 opacity-70">
                Promedio semanal: {formatCurrency(summary.avgWeeklySales)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/30">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className={`scorecard ${summary.trend === "up" ? "scorecard-green" : summary.trend === "down" ? "scorecard-coral" : "scorecard-lavender"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Tendencia</p>
              <p className="text-2xl font-bold mt-1">{trendLabel}</p>
              <p className="text-xs mt-1 opacity-70">
                {summary.trendPercent > 0 ? "+" : ""}{summary.trendPercent.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/30">
              <TrendIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Model Confidence */}
        <div className="scorecard scorecard-blue">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Confianza del Modelo</p>
              <p className="text-2xl font-bold mt-1">
                {metrics.confidenceScore.toFixed(0)}%
              </p>
              <p className="text-xs mt-1 opacity-70">
                MAPE: {metrics.mape.toFixed(1)}% | R²: {metrics.r2.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white/30">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-scorecard-blue-text" />
          <h3 className="text-lg font-semibold text-text-primary">
            Histórico y Pronóstico de Ventas
          </h3>
        </div>
        <ForecastChart data={chartData} />
        <div className="flex items-center gap-6 mt-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#7B9ACC]"></div>
            <span>Ventas Reales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#6BCB77]" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#6BCB77', backgroundColor: 'transparent' }}></div>
            <span>Predicción</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-[#6BCB77]/20 rounded"></div>
            <span>Banda de Confianza (±10%)</span>
          </div>
        </div>
      </div>

      {/* Predictions Table and Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions Table */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-scorecard-lavender-text" />
            <h3 className="text-lg font-semibold text-text-primary">
              Predicciones por Semana
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                    Semana
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                    Fecha
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                    Ventas Estimadas
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                    Rango
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">
                    Festivo
                  </th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr
                    key={pred.weekNumber}
                    className={`border-b border-border/50 hover:bg-secondary/10 ${
                      pred.isHoliday ? "bg-scorecard-green-bg/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-text-primary font-medium">
                      Semana {pred.weekNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {new Date(pred.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary font-semibold text-right">
                      {formatCurrency(pred.predictedSales)}
                    </td>
                    <td className="py-3 px-4 text-xs text-text-muted text-right">
                      {formatCurrency(pred.lowerBound)} - {formatCurrency(pred.upperBound)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {pred.isHoliday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-scorecard-green-bg text-scorecard-green-text text-xs font-medium">
                          <Calendar className="w-3 h-3" />
                          Sí
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Panel */}
        <div className="card p-6 bg-secondary/10">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-text-muted" />
            <h3 className="text-lg font-semibold text-text-primary">
              Metodología
            </h3>
          </div>

          <div className="space-y-4 text-sm">
            {/* Model Name */}
            <div>
              <p className="font-medium text-text-primary mb-1">📊 Modelo Utilizado</p>
              <p className="text-text-secondary text-xs">{methodology.modelName}</p>
            </div>

            {/* Variables */}
            <div>
              <p className="font-medium text-text-primary mb-1">📥 Variables de Entrada</p>
              <ul className="text-text-secondary text-xs space-y-1">
                {methodology.variables.map((v, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-scorecard-blue-text">•</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            {/* Training Period */}
            <div>
              <p className="font-medium text-text-primary mb-1">📅 Período de Entrenamiento</p>
              <p className="text-text-secondary text-xs">
                {new Date(methodology.trainingPeriod.start).toLocaleDateString('es-ES')} -{" "}
                {new Date(methodology.trainingPeriod.end).toLocaleDateString('es-ES')}
              </p>
              <p className="text-text-muted text-xs mt-1">
                ({methodology.dataPoints} semanas de datos)
              </p>
            </div>

            {/* Assumptions */}
            <div>
              <p className="font-medium text-text-primary mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-scorecard-green-text" />
                Supuestos del Modelo
              </p>
              <ul className="text-text-secondary text-xs space-y-1">
                {methodology.assumptions.map((a, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-scorecard-green-text">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            <div>
              <p className="font-medium text-text-primary mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-scorecard-coral-text" />
                Limitaciones
              </p>
              <ul className="text-text-secondary text-xs space-y-1">
                {methodology.limitations.map((l, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-scorecard-coral-text">!</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>

            {/* Metrics */}
            <div className="pt-3 border-t border-border">
              <p className="font-medium text-text-primary mb-2">📈 Métricas de Validación</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/50 rounded p-2 text-center">
                  <p className="text-text-muted font-medium">MAE</p>
                  <p className="font-semibold text-text-primary">
                    ${(metrics.mae / 1_000_000).toFixed(1)}M
                  </p>
                </div>
                <div className="bg-white/50 rounded p-2 text-center">
                  <p className="text-text-muted font-medium">MAPE</p>
                  <p className="font-semibold text-text-primary">
                    {metrics.mape.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white/50 rounded p-2 text-center">
                  <p className="text-text-muted font-medium">R²</p>
                  <p className="font-semibold text-text-primary">
                    {metrics.r2.toFixed(3)}
                  </p>
                </div>
              </div>
              {/* Metric explanations */}
              <div className="mt-3 space-y-2 text-xs text-text-muted bg-white/30 rounded p-3">
                <p>
                  <span className="font-medium text-text-secondary">MAE</span> (Error Absoluto Medio):
                  Promedio de las diferencias absolutas entre predicción y valor real. Menor es mejor.
                </p>
                <p>
                  <span className="font-medium text-text-secondary">MAPE</span> (Error Porcentual Absoluto Medio):
                  Error promedio como porcentaje. Un MAPE &lt;5% indica alta precisión.
                </p>
                <p>
                  <span className="font-medium text-text-secondary">R²</span> (Coeficiente de Determinación):
                  Qué tan bien el modelo explica la variabilidad. 1.0 = perfecto, 0 = no explica nada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
