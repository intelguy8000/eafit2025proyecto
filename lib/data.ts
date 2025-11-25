import Papa from "papaparse";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TrainRecord {
  Store: number;
  Dept: number;
  Date: string;
  Weekly_Sales: number;
  IsHoliday: boolean;
}

export interface FeatureRecord {
  Store: number;
  Date: string;
  Temperature: number;
  Fuel_Price: number;
  MarkDown1: number | null;
  MarkDown2: number | null;
  MarkDown3: number | null;
  MarkDown4: number | null;
  MarkDown5: number | null;
  CPI: number;
  Unemployment: number;
  IsHoliday: boolean;
}

export interface StoreRecord {
  Store: number;
  Type: "A" | "B" | "C";
  Size: number;
}

export interface KPIs {
  totalSales: number;
  weeklyAverage: number;
  totalTransactions: number;
  uniqueStores: number;
  uniqueDepartments: number;
  holidayImpact: {
    holidaySales: number;
    nonHolidaySales: number;
    percentageDiff: number;
  };
  totalMarkdown: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface StoreAggregation {
  store: number;
  type: "A" | "B" | "C";
  size: number;
  totalSales: number;
  avgWeeklySales: number;
  transactionCount: number;
  volatility: number; // Coefficient of variation
  departments: number[];
}

export interface DepartmentAggregation {
  dept: number;
  totalSales: number;
  avgWeeklySales: number;
  transactionCount: number;
  storeCount: number;
}

export interface WeeklyAggregation {
  date: string;
  totalSales: number;
  storeCount: number;
  isHoliday: boolean;
  avgSalesPerStore: number;
}

export interface Anomaly {
  store: number;
  dept: number;
  date: string;
  sales: number;
  type: "high" | "low";
  deviation: number; // How many IQRs from median
}

export interface StoreVolatility {
  store: number;
  type: "A" | "B" | "C";
  mean: number;
  stdDev: number;
  coefficientOfVariation: number;
  risk: "low" | "medium" | "high";
}

// =============================================================================
// CSV PARSING
// =============================================================================

function parseBoolean(value: string): boolean {
  return value.toUpperCase() === "TRUE";
}

function parseNumber(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

function parseNullableNumber(value: string): number | null {
  if (value === "NA" || value === "" || value === "null" || value === undefined) {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export async function loadTrainData(csvContent: string): Promise<TrainRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: Record<string, string>) => ({
          Store: parseInt(row.Store, 10),
          Dept: parseInt(row.Dept, 10),
          Date: row.Date,
          Weekly_Sales: parseNumber(row.Weekly_Sales),
          IsHoliday: parseBoolean(row.IsHoliday),
        }));
        resolve(data);
      },
      error: (error) => reject(error),
    });
  });
}

export async function loadFeaturesData(csvContent: string): Promise<FeatureRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: Record<string, string>) => ({
          Store: parseInt(row.Store, 10),
          Date: row.Date,
          Temperature: parseNumber(row.Temperature),
          Fuel_Price: parseNumber(row.Fuel_Price),
          MarkDown1: parseNullableNumber(row.MarkDown1),
          MarkDown2: parseNullableNumber(row.MarkDown2),
          MarkDown3: parseNullableNumber(row.MarkDown3),
          MarkDown4: parseNullableNumber(row.MarkDown4),
          MarkDown5: parseNullableNumber(row.MarkDown5),
          CPI: parseNumber(row.CPI),
          Unemployment: parseNumber(row.Unemployment),
          IsHoliday: parseBoolean(row.IsHoliday),
        }));
        resolve(data);
      },
      error: (error) => reject(error),
    });
  });
}

export async function loadStoresData(csvContent: string): Promise<StoreRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: Record<string, string>) => ({
          Store: parseInt(row.Store, 10),
          Type: row.Type as "A" | "B" | "C",
          Size: parseInt(row.Size, 10),
        }));
        resolve(data);
      },
      error: (error) => reject(error),
    });
  });
}

// =============================================================================
// KPI CALCULATIONS
// =============================================================================

export function calculateKPIs(
  trainData: TrainRecord[],
  featuresData: FeatureRecord[]
): KPIs {
  // Total and average sales
  const totalSales = trainData.reduce((sum, r) => sum + r.Weekly_Sales, 0);
  const uniqueWeeks = new Set(trainData.map((r) => r.Date)).size;
  const weeklyAverage = totalSales / uniqueWeeks;

  // Unique counts
  const uniqueStores = new Set(trainData.map((r) => r.Store)).size;
  const uniqueDepartments = new Set(trainData.map((r) => r.Dept)).size;

  // Holiday impact
  const holidaySales = trainData
    .filter((r) => r.IsHoliday)
    .reduce((sum, r) => sum + r.Weekly_Sales, 0);
  const holidayCount = trainData.filter((r) => r.IsHoliday).length;

  const nonHolidaySales = trainData
    .filter((r) => !r.IsHoliday)
    .reduce((sum, r) => sum + r.Weekly_Sales, 0);
  const nonHolidayCount = trainData.filter((r) => !r.IsHoliday).length;

  const avgHolidaySales = holidayCount > 0 ? holidaySales / holidayCount : 0;
  const avgNonHolidaySales = nonHolidayCount > 0 ? nonHolidaySales / nonHolidayCount : 0;
  const percentageDiff =
    avgNonHolidaySales > 0
      ? ((avgHolidaySales - avgNonHolidaySales) / avgNonHolidaySales) * 100
      : 0;

  // Total markdown from features (sum all non-null markdowns)
  const totalMarkdown = featuresData.reduce((sum, r) => {
    const md1 = r.MarkDown1 ?? 0;
    const md2 = r.MarkDown2 ?? 0;
    const md3 = r.MarkDown3 ?? 0;
    const md4 = r.MarkDown4 ?? 0;
    const md5 = r.MarkDown5 ?? 0;
    return sum + md1 + md2 + md3 + md4 + md5;
  }, 0);

  // Date range
  const dates = trainData.map((r) => r.Date).sort();
  const dateRange = {
    start: dates[0] || "",
    end: dates[dates.length - 1] || "",
  };

  return {
    totalSales,
    weeklyAverage,
    totalTransactions: trainData.length,
    uniqueStores,
    uniqueDepartments,
    holidayImpact: {
      holidaySales,
      nonHolidaySales,
      percentageDiff,
    },
    totalMarkdown,
    dateRange,
  };
}

// =============================================================================
// AGGREGATIONS
// =============================================================================

export function aggregateByStore(
  trainData: TrainRecord[],
  storesData: StoreRecord[]
): StoreAggregation[] {
  const storeMap = new Map<number, StoreRecord>();
  storesData.forEach((s) => storeMap.set(s.Store, s));

  const aggregated = new Map<
    number,
    {
      sales: number[];
      departments: Set<number>;
    }
  >();

  trainData.forEach((r) => {
    if (!aggregated.has(r.Store)) {
      aggregated.set(r.Store, { sales: [], departments: new Set() });
    }
    const agg = aggregated.get(r.Store)!;
    agg.sales.push(r.Weekly_Sales);
    agg.departments.add(r.Dept);
  });

  const result: StoreAggregation[] = [];

  aggregated.forEach((agg, storeId) => {
    const storeInfo = storeMap.get(storeId);
    const totalSales = agg.sales.reduce((a, b) => a + b, 0);
    const avgWeeklySales = totalSales / agg.sales.length;

    // Calculate coefficient of variation (volatility)
    const mean = avgWeeklySales;
    const variance =
      agg.sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      agg.sales.length;
    const stdDev = Math.sqrt(variance);
    const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

    result.push({
      store: storeId,
      type: storeInfo?.Type || "A",
      size: storeInfo?.Size || 0,
      totalSales,
      avgWeeklySales,
      transactionCount: agg.sales.length,
      volatility,
      departments: Array.from(agg.departments).sort((a, b) => a - b),
    });
  });

  return result.sort((a, b) => b.totalSales - a.totalSales);
}

export function aggregateByDepartment(trainData: TrainRecord[]): DepartmentAggregation[] {
  const aggregated = new Map<
    number,
    {
      sales: number[];
      stores: Set<number>;
    }
  >();

  trainData.forEach((r) => {
    if (!aggregated.has(r.Dept)) {
      aggregated.set(r.Dept, { sales: [], stores: new Set() });
    }
    const agg = aggregated.get(r.Dept)!;
    agg.sales.push(r.Weekly_Sales);
    agg.stores.add(r.Store);
  });

  const result: DepartmentAggregation[] = [];

  aggregated.forEach((agg, deptId) => {
    const totalSales = agg.sales.reduce((a, b) => a + b, 0);
    result.push({
      dept: deptId,
      totalSales,
      avgWeeklySales: totalSales / agg.sales.length,
      transactionCount: agg.sales.length,
      storeCount: agg.stores.size,
    });
  });

  return result.sort((a, b) => b.totalSales - a.totalSales);
}

export function aggregateByWeek(trainData: TrainRecord[]): WeeklyAggregation[] {
  const aggregated = new Map<
    string,
    {
      sales: number;
      stores: Set<number>;
      isHoliday: boolean;
    }
  >();

  trainData.forEach((r) => {
    if (!aggregated.has(r.Date)) {
      aggregated.set(r.Date, { sales: 0, stores: new Set(), isHoliday: r.IsHoliday });
    }
    const agg = aggregated.get(r.Date)!;
    agg.sales += r.Weekly_Sales;
    agg.stores.add(r.Store);
  });

  const result: WeeklyAggregation[] = [];

  aggregated.forEach((agg, date) => {
    result.push({
      date,
      totalSales: agg.sales,
      storeCount: agg.stores.size,
      isHoliday: agg.isHoliday,
      avgSalesPerStore: agg.sales / agg.stores.size,
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// =============================================================================
// ANOMALY DETECTION (IQR Method)
// =============================================================================

function calculateQuartiles(values: number[]): {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q1Index = Math.floor(n * 0.25);
  const medianIndex = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);

  const q1 = sorted[q1Index];
  const median = sorted[medianIndex];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  return { q1, median, q3, iqr };
}

export function detectAnomalies(
  trainData: TrainRecord[],
  multiplier: number = 1.5
): Anomaly[] {
  // Group by store-dept for context-aware anomaly detection
  const groups = new Map<string, TrainRecord[]>();

  trainData.forEach((r) => {
    const key = `${r.Store}-${r.Dept}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  });

  const anomalies: Anomaly[] = [];

  groups.forEach((records) => {
    if (records.length < 10) return; // Need enough data points

    const sales = records.map((r) => r.Weekly_Sales);
    const { q1, median, q3, iqr } = calculateQuartiles(sales);

    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;

    records.forEach((r) => {
      if (r.Weekly_Sales < lowerBound) {
        anomalies.push({
          store: r.Store,
          dept: r.Dept,
          date: r.Date,
          sales: r.Weekly_Sales,
          type: "low",
          deviation: (median - r.Weekly_Sales) / iqr,
        });
      } else if (r.Weekly_Sales > upperBound) {
        anomalies.push({
          store: r.Store,
          dept: r.Dept,
          date: r.Date,
          sales: r.Weekly_Sales,
          type: "high",
          deviation: (r.Weekly_Sales - median) / iqr,
        });
      }
    });
  });

  // Sort by deviation magnitude (most extreme first)
  return anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}

// =============================================================================
// VOLATILITY ANALYSIS
// =============================================================================

export function calculateStoreVolatility(
  trainData: TrainRecord[],
  storesData: StoreRecord[]
): StoreVolatility[] {
  const storeMap = new Map<number, StoreRecord>();
  storesData.forEach((s) => storeMap.set(s.Store, s));

  // Group sales by store
  const storeSales = new Map<number, number[]>();

  trainData.forEach((r) => {
    if (!storeSales.has(r.Store)) {
      storeSales.set(r.Store, []);
    }
    storeSales.get(r.Store)!.push(r.Weekly_Sales);
  });

  const result: StoreVolatility[] = [];

  storeSales.forEach((sales, storeId) => {
    const storeInfo = storeMap.get(storeId);
    const mean = sales.reduce((a, b) => a + b, 0) / sales.length;
    const variance =
      sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

    // Risk classification based on CV
    let risk: "low" | "medium" | "high";
    if (cv < 30) {
      risk = "low";
    } else if (cv < 50) {
      risk = "medium";
    } else {
      risk = "high";
    }

    result.push({
      store: storeId,
      type: storeInfo?.Type || "A",
      mean,
      stdDev,
      coefficientOfVariation: cv,
      risk,
    });
  });

  return result.sort((a, b) => b.coefficientOfVariation - a.coefficientOfVariation);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

// =============================================================================
// OPERATIONAL ANALYTICS
// =============================================================================

export interface WeeklyWithFeatures {
  date: string;
  totalSales: number;
  avgTemperature: number;
  avgFuelPrice: number;
  avgUnemployment: number;
  avgCPI: number;
  isHoliday: boolean;
}

export interface StoreTypePerformance {
  type: "A" | "B" | "C";
  storeCount: number;
  totalSales: number;
  avgSalesPerStore: number;
  avgSize: number;
  avgVolatility: number;
}

export interface TopWeek {
  date: string;
  totalSales: number;
  isHoliday: boolean;
  rank: number;
}

export interface MonthlySales {
  month: number;
  monthName: string;
  avgSales: number;
  totalSales: number;
  weekCount: number;
}

export function aggregateWeeklyWithFeatures(
  trainData: TrainRecord[],
  featuresData: FeatureRecord[]
): WeeklyWithFeatures[] {
  // Create a map of features by date (averaged across stores)
  const featuresByDate = new Map<
    string,
    { temps: number[]; fuels: number[]; unemployments: number[]; cpis: number[]; isHoliday: boolean }
  >();

  featuresData.forEach((f) => {
    if (!featuresByDate.has(f.Date)) {
      featuresByDate.set(f.Date, {
        temps: [],
        fuels: [],
        unemployments: [],
        cpis: [],
        isHoliday: f.IsHoliday,
      });
    }
    const entry = featuresByDate.get(f.Date)!;
    entry.temps.push(f.Temperature);
    entry.fuels.push(f.Fuel_Price);
    entry.unemployments.push(f.Unemployment);
    entry.cpis.push(f.CPI);
  });

  // Aggregate sales by date
  const salesByDate = new Map<string, number>();
  trainData.forEach((t) => {
    salesByDate.set(t.Date, (salesByDate.get(t.Date) || 0) + t.Weekly_Sales);
  });

  const result: WeeklyWithFeatures[] = [];

  salesByDate.forEach((sales, date) => {
    const features = featuresByDate.get(date);
    if (features) {
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      result.push({
        date,
        totalSales: sales,
        avgTemperature: avg(features.temps),
        avgFuelPrice: avg(features.fuels),
        avgUnemployment: avg(features.unemployments),
        avgCPI: avg(features.cpis),
        isHoliday: features.isHoliday,
      });
    }
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateStoreTypePerformance(
  storeAggregations: StoreAggregation[],
  storesData: StoreRecord[]
): StoreTypePerformance[] {
  const typeMap = new Map<"A" | "B" | "C", { stores: StoreAggregation[]; sizes: number[] }>();

  storeAggregations.forEach((sa) => {
    const storeInfo = storesData.find((s) => s.Store === sa.store);
    const type = sa.type;
    if (!typeMap.has(type)) {
      typeMap.set(type, { stores: [], sizes: [] });
    }
    typeMap.get(type)!.stores.push(sa);
    if (storeInfo) {
      typeMap.get(type)!.sizes.push(storeInfo.Size);
    }
  });

  const result: StoreTypePerformance[] = [];

  (["A", "B", "C"] as const).forEach((type) => {
    const data = typeMap.get(type);
    if (data && data.stores.length > 0) {
      const totalSales = data.stores.reduce((sum, s) => sum + s.totalSales, 0);
      const avgVolatility =
        data.stores.reduce((sum, s) => sum + s.volatility, 0) / data.stores.length;
      const avgSize = data.sizes.length > 0
        ? data.sizes.reduce((a, b) => a + b, 0) / data.sizes.length
        : 0;

      result.push({
        type,
        storeCount: data.stores.length,
        totalSales,
        avgSalesPerStore: totalSales / data.stores.length,
        avgSize,
        avgVolatility,
      });
    }
  });

  return result.sort((a, b) => b.totalSales - a.totalSales);
}

export function getTopWeeks(
  weeklyAggregations: WeeklyAggregation[],
  count: number = 5
): TopWeek[] {
  const sorted = [...weeklyAggregations].sort((a, b) => b.totalSales - a.totalSales);
  return sorted.slice(0, count).map((w, i) => ({
    date: w.date,
    totalSales: w.totalSales,
    isHoliday: w.isHoliday,
    rank: i + 1,
  }));
}

export function aggregateByMonth(weeklyAggregations: WeeklyAggregation[]): MonthlySales[] {
  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const monthlyData = new Map<number, { sales: number[]; total: number }>();

  weeklyAggregations.forEach((w) => {
    const date = new Date(w.date);
    const month = date.getMonth();
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { sales: [], total: 0 });
    }
    const data = monthlyData.get(month)!;
    data.sales.push(w.totalSales);
    data.total += w.totalSales;
  });

  const result: MonthlySales[] = [];

  monthlyData.forEach((data, month) => {
    result.push({
      month,
      monthName: monthNames[month],
      avgSales: data.total / data.sales.length,
      totalSales: data.total,
      weekCount: data.sales.length,
    });
  });

  return result.sort((a, b) => a.month - b.month);
}

// =============================================================================
// RISK DETECTION - WEEK OVER WEEK ALERTS
// =============================================================================

export interface WeekOverWeekAlert {
  store: number;
  date: string;
  previousDate: string;
  currentSales: number;
  previousSales: number;
  changePercent: number;
}

export interface WeeklyWithAnomalyFlag {
  date: string;
  totalSales: number;
  isAnomaly: boolean;
  anomalyType: "high" | "low" | null;
  anomalyCount: number;
}

export function detectWeekOverWeekDrops(
  trainData: TrainRecord[],
  threshold: number = -20
): WeekOverWeekAlert[] {
  // Group by store and sort by date
  const storeData = new Map<number, { date: string; sales: number }[]>();

  trainData.forEach((r) => {
    if (!storeData.has(r.Store)) {
      storeData.set(r.Store, []);
    }
    // Aggregate sales by store-date
    const existing = storeData.get(r.Store)!.find((d) => d.date === r.Date);
    if (existing) {
      existing.sales += r.Weekly_Sales;
    } else {
      storeData.get(r.Store)!.push({ date: r.Date, sales: r.Weekly_Sales });
    }
  });

  const alerts: WeekOverWeekAlert[] = [];

  storeData.forEach((data, storeId) => {
    // Sort by date
    const sorted = data.sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      if (prev.sales > 0) {
        const changePercent = ((curr.sales - prev.sales) / prev.sales) * 100;

        if (changePercent <= threshold) {
          alerts.push({
            store: storeId,
            date: curr.date,
            previousDate: prev.date,
            currentSales: curr.sales,
            previousSales: prev.sales,
            changePercent,
          });
        }
      }
    }
  });

  // Sort by change percent (most negative first)
  return alerts.sort((a, b) => a.changePercent - b.changePercent);
}

export function aggregateWeeklyWithAnomalies(
  weeklyAggregations: WeeklyAggregation[],
  anomalies: Anomaly[]
): WeeklyWithAnomalyFlag[] {
  // Count anomalies per date
  const anomalyCountByDate = new Map<string, { high: number; low: number }>();

  anomalies.forEach((a) => {
    if (!anomalyCountByDate.has(a.date)) {
      anomalyCountByDate.set(a.date, { high: 0, low: 0 });
    }
    const counts = anomalyCountByDate.get(a.date)!;
    if (a.type === "high") {
      counts.high++;
    } else {
      counts.low++;
    }
  });

  return weeklyAggregations.map((w) => {
    const counts = anomalyCountByDate.get(w.date);
    const totalAnomalies = counts ? counts.high + counts.low : 0;
    let anomalyType: "high" | "low" | null = null;

    if (counts) {
      anomalyType = counts.high > counts.low ? "high" : "low";
    }

    return {
      date: w.date,
      totalSales: w.totalSales,
      isAnomaly: totalAnomalies > 5, // Flag if more than 5 anomalies in that week
      anomalyType,
      anomalyCount: totalAnomalies,
    };
  });
}

// =============================================================================
// DATA LOADER (for API routes or server components)
// =============================================================================

export interface WalmartData {
  train: TrainRecord[];
  features: FeatureRecord[];
  stores: StoreRecord[];
  kpis: KPIs;
  storeAggregations: StoreAggregation[];
  departmentAggregations: DepartmentAggregation[];
  weeklyAggregations: WeeklyAggregation[];
  anomalies: Anomaly[];
  volatility: StoreVolatility[];
  weeklyWithFeatures: WeeklyWithFeatures[];
  storeTypePerformance: StoreTypePerformance[];
  topWeeks: TopWeek[];
  monthlySales: MonthlySales[];
  weekOverWeekAlerts: WeekOverWeekAlert[];
  weeklyWithAnomalies: WeeklyWithAnomalyFlag[];
}

export async function loadAllData(
  trainCsv: string,
  featuresCsv: string,
  storesCsv: string
): Promise<WalmartData> {
  const [train, features, stores] = await Promise.all([
    loadTrainData(trainCsv),
    loadFeaturesData(featuresCsv),
    loadStoresData(storesCsv),
  ]);

  const kpis = calculateKPIs(train, features);
  const storeAggregations = aggregateByStore(train, stores);
  const departmentAggregations = aggregateByDepartment(train);
  const weeklyAggregations = aggregateByWeek(train);
  const anomalies = detectAnomalies(train);
  const volatility = calculateStoreVolatility(train, stores);
  const weeklyWithFeatures = aggregateWeeklyWithFeatures(train, features);
  const storeTypePerformance = calculateStoreTypePerformance(storeAggregations, stores);
  const topWeeks = getTopWeeks(weeklyAggregations, 5);
  const monthlySales = aggregateByMonth(weeklyAggregations);
  const weekOverWeekAlerts = detectWeekOverWeekDrops(train, -20);
  const weeklyWithAnomalies = aggregateWeeklyWithAnomalies(weeklyAggregations, anomalies);

  return {
    train,
    features,
    stores,
    kpis,
    storeAggregations,
    departmentAggregations,
    weeklyAggregations,
    anomalies,
    volatility,
    weeklyWithFeatures,
    storeTypePerformance,
    topWeeks,
    monthlySales,
    weekOverWeekAlerts,
    weeklyWithAnomalies,
  };
}
