"use client";

import { BarChart3, Calendar } from "lucide-react";

export function Header() {
  return (
    <header className="bg-bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Walmart Analytics
            </h1>
            <p className="text-sm text-text-muted">
              Business Intelligence Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Calendar className="w-4 h-4" />
          <span>POC - 40 días</span>
        </div>
      </div>
    </header>
  );
}
