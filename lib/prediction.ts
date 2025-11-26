// Simple forecasting model using Holt-Winters inspired approach
// with trend and seasonality components

export interface WeeklyDataPoint {
  date: string;
  totalSales: number;
  isHoliday: boolean;
}

export interface PredictionResult {
  date: string;
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  isHoliday: boolean;
  weekNumber: number;
}

export interface ModelMetrics {
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  r2: number; // R-squared
  confidenceScore: number; // Overall confidence (0-100)
}

export interface ForecastOutput {
  predictions: PredictionResult[];
  metrics: ModelMetrics;
  methodology: MethodologyInfo;
  summary: ForecastSummary;
}

export interface MethodologyInfo {
  modelName: string;
  variables: string[];
  trainingPeriod: { start: string; end: string };
  dataPoints: number;
  assumptions: string[];
  limitations: string[];
}

export interface ForecastSummary {
  nextMonthSales: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  avgWeeklySales: number;
}

// Holiday weeks (approximate - based on US holidays in Walmart data)
const HOLIDAY_WEEKS = [
  { month: 2, week: 2 }, // Super Bowl
  { month: 9, week: 1 }, // Labor Day
  { month: 11, week: 4 }, // Thanksgiving
  { month: 12, week: 4 }, // Christmas
];

function isHolidayWeek(date: Date): boolean {
  const month = date.getMonth() + 1;
  const weekOfMonth = Math.ceil(date.getDate() / 7);
  return HOLIDAY_WEEKS.some(h => h.month === month && h.week === weekOfMonth);
}

// Calculate seasonal indices (monthly averages relative to overall average)
function calculateSeasonalIndices(data: WeeklyDataPoint[]): Record<number, number> {
  const monthlyTotals: Record<number, { sum: number; count: number }> = {};

  data.forEach(d => {
    const month = new Date(d.date).getMonth() + 1;
    if (!monthlyTotals[month]) {
      monthlyTotals[month] = { sum: 0, count: 0 };
    }
    monthlyTotals[month].sum += d.totalSales;
    monthlyTotals[month].count++;
  });

  const overallAvg = data.reduce((sum, d) => sum + d.totalSales, 0) / data.length;
  const indices: Record<number, number> = {};

  for (let month = 1; month <= 12; month++) {
    if (monthlyTotals[month] && monthlyTotals[month].count > 0) {
      const monthAvg = monthlyTotals[month].sum / monthlyTotals[month].count;
      indices[month] = monthAvg / overallAvg;
    } else {
      indices[month] = 1;
    }
  }

  return indices;
}

// Calculate holiday impact factor
function calculateHolidayImpact(data: WeeklyDataPoint[]): number {
  const holidayWeeks = data.filter(d => d.isHoliday);
  const normalWeeks = data.filter(d => !d.isHoliday);

  if (holidayWeeks.length === 0 || normalWeeks.length === 0) return 1.1;

  const holidayAvg = holidayWeeks.reduce((sum, d) => sum + d.totalSales, 0) / holidayWeeks.length;
  const normalAvg = normalWeeks.reduce((sum, d) => sum + d.totalSales, 0) / normalWeeks.length;

  return holidayAvg / normalAvg;
}

// Simple linear regression for trend
function calculateTrend(data: WeeklyDataPoint[]): { slope: number; intercept: number } {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  data.forEach((d, i) => {
    const x = i;
    const y = d.totalSales;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Calculate model metrics on training data
function calculateMetrics(actual: number[], predicted: number[]): ModelMetrics {
  const n = actual.length;
  let sumAbsError = 0;
  let sumAbsPercentError = 0;
  let sumSquaredError = 0;
  const meanActual = actual.reduce((a, b) => a + b, 0) / n;
  let totalSS = 0;

  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    sumAbsError += Math.abs(error);
    sumAbsPercentError += Math.abs(error / actual[i]) * 100;
    sumSquaredError += error * error;
    totalSS += (actual[i] - meanActual) ** 2;
  }

  const mae = sumAbsError / n;
  const mape = sumAbsPercentError / n;
  const r2 = Math.max(0, 1 - (sumSquaredError / totalSS));

  // Confidence score based on MAPE (lower is better)
  const confidenceScore = Math.max(0, Math.min(100, 100 - mape));

  return { mae, mape, r2, confidenceScore };
}

export function generateForecast(
  historicalData: WeeklyDataPoint[],
  weeksToPredict: number = 12
): ForecastOutput {
  // Sort data by date
  const sortedData = [...historicalData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate model components
  const seasonalIndices = calculateSeasonalIndices(sortedData);
  const holidayImpact = calculateHolidayImpact(sortedData);
  const trend = calculateTrend(sortedData);

  // Base level (average of last 4 weeks for smoothing)
  const recentWeeks = sortedData.slice(-4);
  const baseLevel = recentWeeks.reduce((sum, d) => sum + d.totalSales, 0) / recentWeeks.length;

  // Generate predictions
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  const predictions: PredictionResult[] = [];

  for (let week = 1; week <= weeksToPredict; week++) {
    const predDate = new Date(lastDate);
    predDate.setDate(predDate.getDate() + (week * 7));

    const month = predDate.getMonth() + 1;
    const seasonalFactor = seasonalIndices[month] || 1;
    const isHoliday = isHolidayWeek(predDate);
    const holidayFactor = isHoliday ? holidayImpact : 1;

    // Prediction = base + trend + seasonality + holiday effect
    const trendComponent = trend.slope * (sortedData.length + week);
    const basePrediction = baseLevel * seasonalFactor * holidayFactor;

    // Weighted combination
    const predictedSales = basePrediction * 0.7 + (trend.intercept + trendComponent) * 0.3;

    // Confidence bounds (±10%)
    const margin = predictedSales * 0.10;

    predictions.push({
      date: predDate.toISOString().split('T')[0],
      predictedSales: Math.round(predictedSales),
      lowerBound: Math.round(predictedSales - margin),
      upperBound: Math.round(predictedSales + margin),
      isHoliday,
      weekNumber: week,
    });
  }

  // Calculate metrics using last 20% of data as validation
  const splitIndex = Math.floor(sortedData.length * 0.8);
  const trainingData = sortedData.slice(0, splitIndex);
  const validationData = sortedData.slice(splitIndex);

  // Re-fit model on training data and predict validation period
  const trainSeasonalIndices = calculateSeasonalIndices(trainingData);
  const trainTrend = calculateTrend(trainingData);
  const trainBaseLevel = trainingData.slice(-4).reduce((sum, d) => sum + d.totalSales, 0) / 4;
  const trainHolidayImpact = calculateHolidayImpact(trainingData);

  const validationPredictions = validationData.map((d, i) => {
    const date = new Date(d.date);
    const month = date.getMonth() + 1;
    const seasonalFactor = trainSeasonalIndices[month] || 1;
    const holidayFactor = d.isHoliday ? trainHolidayImpact : 1;
    const trendComponent = trainTrend.slope * (trainingData.length + i);
    const basePrediction = trainBaseLevel * seasonalFactor * holidayFactor;
    return basePrediction * 0.7 + (trainTrend.intercept + trendComponent) * 0.3;
  });

  const metrics = calculateMetrics(
    validationData.map(d => d.totalSales),
    validationPredictions
  );

  // Calculate summary
  const next4Weeks = predictions.slice(0, 4);
  const nextMonthSales = next4Weeks.reduce((sum, p) => sum + p.predictedSales, 0);
  const avgWeeklySales = nextMonthSales / 4;

  // Compare to last month of historical data
  const lastMonthHistorical = sortedData.slice(-4);
  const lastMonthAvg = lastMonthHistorical.reduce((sum, d) => sum + d.totalSales, 0) / 4;
  const trendPercent = ((avgWeeklySales - lastMonthAvg) / lastMonthAvg) * 100;

  let trendDirection: "up" | "down" | "stable";
  if (trendPercent > 2) trendDirection = "up";
  else if (trendPercent < -2) trendDirection = "down";
  else trendDirection = "stable";

  const summary: ForecastSummary = {
    nextMonthSales,
    trend: trendDirection,
    trendPercent,
    avgWeeklySales,
  };

  const methodology: MethodologyInfo = {
    modelName: "Holt-Winters Simplificado con Regresión Lineal",
    variables: [
      "Ventas semanales históricas",
      "Índices de estacionalidad mensual",
      "Factor de impacto festivo",
      "Tendencia lineal"
    ],
    trainingPeriod: {
      start: sortedData[0].date,
      end: sortedData[sortedData.length - 1].date,
    },
    dataPoints: sortedData.length,
    assumptions: [
      "Estacionalidad mensual constante",
      "Tendencia lineal en el tiempo",
      "Impacto festivo proporcional al promedio histórico",
      "Patrones pasados se repiten en el futuro"
    ],
    limitations: [
      "No considera factores macroeconómicos (inflación, desempleo)",
      "No incluye eventos externos (competencia, promociones)",
      "Asume continuidad de operaciones (sin cierres)",
      "Precisión decrece a mayor horizonte de predicción"
    ],
  };

  return {
    predictions,
    metrics,
    methodology,
    summary,
  };
}

// Chart data point type
export interface ChartDataPoint {
  date: string;
  actual?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
  isHoliday: boolean;
}

// Prepare historical data for the chart (last N weeks + predictions)
export function prepareChartData(
  historical: WeeklyDataPoint[],
  predictions: PredictionResult[],
  lastNWeeks: number = 52
): ChartDataPoint[] {
  const sortedHistorical = [...historical]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-lastNWeeks);

  const chartData: ChartDataPoint[] = sortedHistorical.map(d => ({
    date: d.date,
    actual: d.totalSales,
    predicted: undefined,
    lowerBound: undefined,
    upperBound: undefined,
    isHoliday: d.isHoliday,
  }));

  // Add predictions
  predictions.forEach(p => {
    chartData.push({
      date: p.date,
      actual: undefined,
      predicted: p.predictedSales,
      lowerBound: p.lowerBound,
      upperBound: p.upperBound,
      isHoliday: p.isHoliday,
    });
  });

  return chartData;
}
