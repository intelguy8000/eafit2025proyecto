"use client";

import {
  Calendar,
  Store,
  Activity,
  Bell,
  Thermometer,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Lightbulb,
  BarChart3,
  Cpu,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface ScalingPlanProps {
  holidayImpact: number;
  highRiskStores: number;
  typeAAvgSales: number;
  typeBCAvgSales: number;
}

interface OpportunityCard {
  id: string;
  title: string;
  insight: string;
  action: string;
  impact: string;
  impactType: "revenue" | "cost" | "risk";
  icon: React.ReactNode;
  color: string;
}

export function ScalingPlan({
  holidayImpact,
  highRiskStores,
  typeAAvgSales,
  typeBCAvgSales,
}: ScalingPlanProps) {
  const typeAMultiplier = typeBCAvgSales > 0 ? (typeAAvgSales / typeBCAvgSales).toFixed(1) : "2";

  const opportunities: OpportunityCard[] = [
    {
      id: "holidays",
      title: "Optimización de Festivos",
      insight: `Los festivos generan +${holidayImpact.toFixed(1)}% en ventas promedio`,
      action: "Aumentar inventario 2 semanas antes de festivos clave",
      impact: "↑ Ingresos en semanas pico",
      impactType: "revenue",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-scorecard-green-bg text-scorecard-green-text",
    },
    {
      id: "typeA",
      title: "Replicar Modelo Tiendas A",
      insight: `Tiendas tipo A venden ${typeAMultiplier}x más que B/C en promedio`,
      action: "Implementar best practices de A en tiendas B y C",
      impact: "↑ Revenue por tienda",
      impactType: "revenue",
      icon: <Store className="w-6 h-6" />,
      color: "bg-scorecard-blue-bg text-scorecard-blue-text",
    },
    {
      id: "volatility",
      title: "Estabilizar Tiendas Volátiles",
      insight: `${highRiskStores} tiendas con alta volatilidad (>50% CV)`,
      action: "Investigar causas raíz y aplicar correctivos",
      impact: "↓ Costos operativos",
      impactType: "cost",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-scorecard-coral-bg text-scorecard-coral-text",
    },
    {
      id: "alerts",
      title: "Sistema de Alertas Tempranas",
      insight: "Detectar automáticamente caídas >20% semana a semana",
      action: "Implementar notificaciones y protocolos de respuesta",
      impact: "↓ Pérdidas por reacción tardía",
      impactType: "risk",
      icon: <Bell className="w-6 h-6" />,
      color: "bg-scorecard-lavender-bg text-scorecard-lavender-text",
    },
    {
      id: "external",
      title: "Ajuste por Factores Externos",
      insight: "Correlación identificada con temperatura y precio de gasolina",
      action: "Crear promociones dinámicas según condiciones externas",
      impact: "↑ Ventas incrementales",
      impactType: "revenue",
      icon: <Thermometer className="w-6 h-6" />,
      color: "bg-scorecard-green-bg text-scorecard-green-text",
    },
  ];

  const ebitdaImpact = [
    {
      initiative: "Festivos optimizados",
      via: "↑ Ingresos",
      estimation: "+5-8% en semanas pico",
      icon: <TrendingUp className="w-4 h-4 text-scorecard-green-text" />,
    },
    {
      initiative: "Modelo Tiendas A",
      via: "↑ Ingresos",
      estimation: "+10-15% tiendas B/C",
      icon: <TrendingUp className="w-4 h-4 text-scorecard-green-text" />,
    },
    {
      initiative: "Reducir volatilidad",
      via: "↓ Costos",
      estimation: "-3-5% costos operativos",
      icon: <TrendingDown className="w-4 h-4 text-scorecard-blue-text" />,
    },
    {
      initiative: "Alertas tempranas",
      via: "↓ Pérdidas",
      estimation: "Evitar caídas prolongadas",
      icon: <TrendingDown className="w-4 h-4 text-scorecard-blue-text" />,
    },
    {
      initiative: "Ajuste externos",
      via: "↑ Ingresos",
      estimation: "+2-4% ventas incrementales",
      icon: <TrendingUp className="w-4 h-4 text-scorecard-green-text" />,
    },
  ];

  const phases = [
    {
      phase: "Fase 1",
      title: "Monitoreo Semanal",
      description: "Implementar este dashboard como herramienta de seguimiento continuo",
      status: "current",
      icon: <BarChart3 className="w-5 h-5" />,
      items: [
        "Revisión semanal de KPIs",
        "Identificación de anomalías",
        "Tracking de tiendas en riesgo",
      ],
    },
    {
      phase: "Fase 2",
      title: "Modelo Predictivo",
      description: "Desarrollar ML para forecast de ventas y detección temprana",
      status: "next",
      icon: <Cpu className="w-5 h-5" />,
      items: [
        "Predicción de demanda por tienda",
        "Alertas predictivas de caídas",
        "Optimización de promociones",
      ],
    },
    {
      phase: "Fase 3",
      title: "Integración Operativa",
      description: "Conectar insights con sistemas de inventario y operaciones",
      status: "future",
      icon: <Package className="w-5 h-5" />,
      items: [
        "Ajuste automático de inventario",
        "Recomendaciones en tiempo real",
        "Dashboard ejecutivo integrado",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="card p-6 bg-gradient-to-r from-scorecard-blue-bg/50 to-scorecard-lavender-bg/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/50 rounded-xl">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Plan de Escalado: De Datos a EBITDA
            </h2>
            <p className="text-sm text-text-secondary">
              Oportunidades identificadas a partir del análisis de {formatCurrency(0)} en ventas históricas.
              Cada iniciativa tiene un camino claro hacia impacto financiero medible.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-scorecard-green-text" />
          <h3 className="text-lg font-semibold text-text-primary">
            Oportunidades Identificadas
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-2 rounded-lg ${opp.color} mb-3`}>
                {opp.icon}
              </div>
              <h4 className="font-semibold text-text-primary mb-2">{opp.title}</h4>
              <p className="text-sm text-text-secondary mb-3">{opp.insight}</p>
              <div className="flex items-start gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-text-primary">{opp.action}</p>
              </div>
              <div
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                  opp.impactType === "revenue"
                    ? "bg-scorecard-green-bg text-scorecard-green-text"
                    : opp.impactType === "cost"
                    ? "bg-scorecard-blue-bg text-scorecard-blue-text"
                    : "bg-scorecard-lavender-bg text-scorecard-lavender-text"
                }`}
              >
                {opp.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: EBITDA Impact */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-scorecard-green-text" />
          <h3 className="text-lg font-semibold text-text-primary">
            Impacto Estimado en EBITDA
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                  Iniciativa
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                  Vía de Impacto
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">
                  Estimación
                </th>
              </tr>
            </thead>
            <tbody>
              {ebitdaImpact.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/50 hover:bg-secondary/10"
                >
                  <td className="py-3 px-4 text-sm text-text-primary font-medium">
                    {item.initiative}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                      {item.icon}
                      {item.via}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-text-primary">
                      {item.estimation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-scorecard-green-bg/30 rounded-lg">
          <p className="text-sm text-scorecard-green-text">
            <strong>Impacto combinado estimado:</strong> Las iniciativas en conjunto pueden generar
            un incremento del 15-25% en margen operativo a través de mayores ingresos y menores
            costos por ineficiencias.
          </p>
        </div>
      </div>

      {/* Section 3: Next Steps */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Próximos Pasos: Roadmap de Implementación
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((phase, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border-2 ${
                phase.status === "current"
                  ? "border-primary bg-scorecard-blue-bg/30"
                  : phase.status === "next"
                  ? "border-secondary bg-secondary/10"
                  : "border-border bg-bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    phase.status === "current"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/30 text-text-muted"
                  }`}
                >
                  {phase.icon}
                </div>
                <div>
                  <span
                    className={`text-xs font-medium ${
                      phase.status === "current"
                        ? "text-primary"
                        : "text-text-muted"
                    }`}
                  >
                    {phase.phase}
                  </span>
                  <h4 className="font-semibold text-text-primary">{phase.title}</h4>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-3">{phase.description}</p>
              <ul className="space-y-2">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        phase.status === "current"
                          ? "text-primary"
                          : "text-text-muted"
                      }`}
                    />
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              {phase.status === "current" && (
                <div className="mt-4 pt-3 border-t border-primary/20">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    En progreso
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="card p-6 bg-gradient-to-r from-primary/10 to-scorecard-lavender-bg/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-semibold text-text-primary mb-1">
              ¿Listo para implementar?
            </h4>
            <p className="text-sm text-text-secondary">
              Este POC de 40 días demuestra el valor. El siguiente paso es productivizar
              el monitoreo y comenzar con las iniciativas de mayor impacto.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Agendar Revisión
            </button>
            <button className="px-4 py-2 bg-white border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors">
              Exportar Informe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
