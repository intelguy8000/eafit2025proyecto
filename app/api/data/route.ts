import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { loadAllData } from "@/lib/data";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");

    const [trainCsv, featuresCsv, storesCsv] = await Promise.all([
      fs.readFile(path.join(dataDir, "train.csv"), "utf-8"),
      fs.readFile(path.join(dataDir, "features.csv"), "utf-8"),
      fs.readFile(path.join(dataDir, "stores.csv"), "utf-8"),
    ]);

    const data = await loadAllData(trainCsv, featuresCsv, storesCsv);

    // Return only what's needed for the dashboard (avoid sending 421K raw records)
    return NextResponse.json({
      kpis: data.kpis,
      storeAggregations: data.storeAggregations.slice(0, 20), // Top 20 stores
      departmentAggregations: data.departmentAggregations.slice(0, 15), // Top 15 depts
      weeklyAggregations: data.weeklyAggregations,
      anomalies: data.anomalies.slice(0, 50), // Top 50 anomalies
      volatility: data.volatility,
      stores: data.stores,
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return NextResponse.json(
      {
        error: "Failed to load data. Make sure CSV files are in the data/ folder.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
