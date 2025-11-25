"use client";

import { Database, Store } from "lucide-react";
import Image from "next/image";

export function Header() {
  return (
    <header className="bg-bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* EAFIT Logo */}
          <div className="flex-shrink-0">
            <Image
              src="https://www.eafit.edu.co/sites/default/files/logo_EAFIT_negro.svg"
              alt="EAFIT Logo"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-border hidden sm:block" />

          {/* Title */}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary">
              POC Business Analytics - Walmart Sales
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              EAFIT · Análisis de 45 tiendas · 421K registros
            </p>
          </div>
        </div>

        {/* Stats badges */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-scorecard-blue-bg/50 rounded-lg">
            <Store className="w-4 h-4 text-scorecard-blue-text" />
            <span className="text-xs font-medium text-scorecard-blue-text">45 Tiendas</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-scorecard-lavender-bg/50 rounded-lg">
            <Database className="w-4 h-4 text-scorecard-lavender-text" />
            <span className="text-xs font-medium text-scorecard-lavender-text">421K Registros</span>
          </div>
        </div>
      </div>
    </header>
  );
}
