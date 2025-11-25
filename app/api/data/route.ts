import { NextResponse } from "next/server";
import {
  getKPIs,
  getStores,
  getWeeklyAggregations,
  getStoreAggregations,
  getDepartmentAggregations,
  getHolidayImpact,
  getWeeklyWithFeatures,
  getStoreTypePerformance,
  getTopWeeks,
  getMonthlySales,
  getStoreVolatility,
  getRiskCounts,
  getAnomalies,
  getWeeklyWithAnomalies,
  getWeekOverWeekAlerts,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Fetch all data in parallel from Neon
    const [
      kpisRaw,
      holidayImpact,
      stores,
      weeklyAggregations,
      storeAggregations,
      departmentAggregations,
      weeklyWithFeatures,
      storeTypePerformance,
      topWeeks,
      monthlySales,
      volatility,
      riskCounts,
      anomalies,
      weeklyWithAnomalies,
      weekOverWeekAlerts,
    ] = await Promise.all([
      getKPIs(),
      getHolidayImpact(),
      getStores(),
      getWeeklyAggregations(),
      getStoreAggregations(),
      getDepartmentAggregations(),
      getWeeklyWithFeatures(),
      getStoreTypePerformance(),
      getTopWeeks(5),
      getMonthlySales(),
      getStoreVolatility(),
      getRiskCounts(),
      getAnomalies(),
      getWeeklyWithAnomalies(),
      getWeekOverWeekAlerts(-20),
    ]);

    // Process holiday impact
    const holidayData = holidayImpact.find((h) => h.is_holiday === true);
    const nonHolidayData = holidayImpact.find((h) => h.is_holiday === false);

    const holidaySales = Number(holidayData?.total_sales || 0);
    const nonHolidaySales = Number(nonHolidayData?.total_sales || 0);
    const avgHolidaySales = Number(holidayData?.avg_sales || 0);
    const avgNonHolidaySales = Number(nonHolidayData?.avg_sales || 0);
    const percentageDiff = avgNonHolidaySales > 0
      ? ((avgHolidaySales - avgNonHolidaySales) / avgNonHolidaySales) * 100
      : 0;

    // Format KPIs
    const kpis = {
      totalSales: Number(kpisRaw.total_sales),
      weeklyAverage: Number(kpisRaw.total_sales) / new Set(weeklyAggregations.map((w) => w.date)).size,
      totalTransactions: Number(kpisRaw.total_transactions),
      uniqueStores: Number(kpisRaw.unique_stores),
      uniqueDepartments: Number(kpisRaw.unique_departments),
      holidayImpact: {
        holidaySales,
        nonHolidaySales,
        percentageDiff,
      },
      totalMarkdown: 0,
      dateRange: {
        start: kpisRaw.start_date,
        end: kpisRaw.end_date,
      },
    };

    // Format weekly aggregations
    const formattedWeekly = weeklyAggregations.map((w) => ({
      date: w.date,
      totalSales: Number(w.total_sales),
      storeCount: Number(w.store_count),
      isHoliday: w.is_holiday,
      avgSalesPerStore: Number(w.total_sales) / Number(w.store_count),
    }));

    // Format store aggregations (limit to 20)
    const formattedStores = storeAggregations.slice(0, 20).map((s) => ({
      store: s.store,
      type: s.type || "A",
      size: s.size || 0,
      totalSales: Number(s.total_sales),
      avgWeeklySales: Number(s.avg_weekly_sales),
      transactionCount: Number(s.transaction_count),
      volatility: Number(s.volatility) || 0,
      departments: s.departments || [],
    }));

    // Format department aggregations (limit to 15)
    const formattedDepts = departmentAggregations.slice(0, 15).map((d) => ({
      dept: d.dept,
      totalSales: Number(d.total_sales),
      avgWeeklySales: Number(d.avg_weekly_sales),
      transactionCount: Number(d.transaction_count),
      storeCount: Number(d.store_count),
    }));

    // Format weekly with features
    const formattedWeeklyFeatures = weeklyWithFeatures.map((w) => ({
      date: w.date,
      totalSales: Number(w.total_sales),
      avgTemperature: Number(w.avg_temperature),
      avgFuelPrice: Number(w.avg_fuel_price),
      avgUnemployment: Number(w.avg_unemployment),
      avgCPI: Number(w.avg_cpi),
      isHoliday: w.is_holiday,
    }));

    // Format store type performance
    const formattedTypePerf = storeTypePerformance.map((t) => ({
      type: t.type as "A" | "B" | "C",
      storeCount: Number(t.store_count),
      totalSales: Number(t.total_sales),
      avgSalesPerStore: Number(t.total_sales) / Number(t.store_count),
      avgSize: Number(t.avg_size),
      avgVolatility: Number(t.avg_volatility) || 0,
    }));

    // Format top weeks
    const formattedTopWeeks = topWeeks.map((w, i) => ({
      date: w.date,
      totalSales: Number(w.total_sales),
      isHoliday: w.is_holiday,
      rank: i + 1,
    }));

    // Format anomalies (already limited to 10 in query)
    const formattedAnomalies = anomalies.map((a) => ({
      store: a.store,
      dept: a.dept,
      date: a.date,
      sales: Number(a.sales),
      type: a.type,
      deviation: Number(a.deviation),
    }));

    // Format weekly with anomalies
    const formattedWeeklyAnomalies = weeklyWithAnomalies.map((w) => ({
      date: w.date,
      totalSales: Number(w.total_sales),
      isAnomaly: w.is_anomaly,
      anomalyType: w.anomaly_type,
      anomalyCount: w.anomaly_count,
    }));

    // Format week over week alerts (already limited to 15 in query)
    const formattedAlerts = weekOverWeekAlerts.map((a) => ({
      store: a.store,
      date: a.date,
      previousDate: a.previous_date,
      currentSales: Number(a.current_sales),
      previousSales: Number(a.previous_sales),
      changePercent: Number(a.change_percent),
    }));

    return NextResponse.json({
      kpis,
      storeAggregations: formattedStores,
      departmentAggregations: formattedDepts,
      weeklyAggregations: formattedWeekly,
      anomalies: formattedAnomalies,
      volatility,
      riskCounts,
      stores,
      weeklyWithFeatures: formattedWeeklyFeatures,
      storeTypePerformance: formattedTypePerf,
      topWeeks: formattedTopWeeks,
      monthlySales,
      weekOverWeekAlerts: formattedAlerts,
      weeklyWithAnomalies: formattedWeeklyAnomalies,
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return NextResponse.json(
      {
        error: "Failed to load data from database.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
