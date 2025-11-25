"use client";

import { Header } from "@/components/Header";
import { Scorecard } from "@/components/Scorecard";
import {
  DollarSign,
  ShoppingCart,
  Store,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-page">
      <Header />

      <main className="p-6">
        {/* Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Scorecard
            title="Ventas Totales"
            value="$4.2M"
            subtitle="Este periodo"
            icon={DollarSign}
            variant="blue"
            trend={{ value: 12.5, isPositive: true }}
          />
          <Scorecard
            title="Transacciones"
            value="152,847"
            subtitle="Ordenes procesadas"
            icon={ShoppingCart}
            variant="lavender"
            trend={{ value: 8.3, isPositive: true }}
          />
          <Scorecard
            title="Tiendas Activas"
            value="45"
            subtitle="De 45 totales"
            icon={Store}
            variant="green"
          />
          <Scorecard
            title="Markdown Total"
            value="$287K"
            subtitle="Descuentos aplicados"
            icon={TrendingUp}
            variant="coral"
            trend={{ value: 3.2, isPositive: false }}
          />
        </div>

        {/* Charts placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Ventas por Semana
            </h3>
            <div className="h-64 flex items-center justify-center text-text-muted">
              Cargar datos desde train.csv para visualizar
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Ventas por Tienda
            </h3>
            <div className="h-64 flex items-center justify-center text-text-muted">
              Cargar datos desde stores.csv para visualizar
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-6 card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Archivos de Datos
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Coloca los archivos CSV de Walmart en la carpeta <code className="bg-secondary/30 px-2 py-1 rounded">data/</code>
          </p>
          <ul className="text-sm text-text-muted space-y-1">
            <li>• <strong>train.csv</strong> - Datos históricos de ventas</li>
            <li>• <strong>features.csv</strong> - Características adicionales (CPI, desempleo, etc.)</li>
            <li>• <strong>stores.csv</strong> - Información de tiendas</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
