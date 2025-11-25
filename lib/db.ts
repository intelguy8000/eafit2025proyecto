import { neon } from "@neondatabase/serverless";

const connectionString = process.env.STORAGE_DATABASE_URL;

if (!connectionString) {
  throw new Error("STORAGE_DATABASE_URL is not set");
}

export const sql = neon(connectionString);

// =============================================================================
// DATABASE TYPES
// =============================================================================

export interface DBStore {
  store: number;
  type: string;
  size: number;
}

export interface DBSale {
  store: number;
  dept: number;
  date: string;
  weekly_sales: number;
  is_holiday: boolean;
}

export interface DBFeature {
  store: number;
  date: string;
  temperature: number;
  fuel_price: number;
  cpi: number;
  unemployment: number;
  is_holiday: boolean;
}

// =============================================================================
// CREATE TABLES
// =============================================================================

export async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS stores (
      store INT PRIMARY KEY,
      type VARCHAR(1) NOT NULL,
      size INT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      store INT NOT NULL,
      dept INT NOT NULL,
      date DATE NOT NULL,
      weekly_sales DECIMAL(15,2) NOT NULL,
      is_holiday BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS features (
      id SERIAL PRIMARY KEY,
      store INT NOT NULL,
      date DATE NOT NULL,
      temperature DECIMAL(10,2),
      fuel_price DECIMAL(10,3),
      cpi DECIMAL(15,6),
      unemployment DECIMAL(10,3),
      is_holiday BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  // Create indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_dept ON sales(dept)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_features_store ON features(store)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_features_date ON features(date)`;

  console.log("Tables created successfully");
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

export async function getStores(): Promise<DBStore[]> {
  const result = await sql`SELECT store, type, size FROM stores ORDER BY store`;
  return result as DBStore[];
}

export async function getSalesData(): Promise<DBSale[]> {
  const result = await sql`
    SELECT store, dept, date::text, weekly_sales, is_holiday
    FROM sales
    ORDER BY date, store, dept
  `;
  return result as DBSale[];
}

export async function getFeaturesData(): Promise<DBFeature[]> {
  const result = await sql`
    SELECT store, date::text, temperature, fuel_price, cpi, unemployment, is_holiday
    FROM features
    ORDER BY date, store
  `;
  return result as DBFeature[];
}

// =============================================================================
// AGGREGATED QUERIES (for performance)
// =============================================================================

export async function getKPIs() {
  const result = await sql`
    SELECT
      SUM(weekly_sales) as total_sales,
      COUNT(*) as total_transactions,
      COUNT(DISTINCT store) as unique_stores,
      COUNT(DISTINCT dept) as unique_departments,
      MIN(date)::text as start_date,
      MAX(date)::text as end_date
    FROM sales
  `;
  return result[0];
}

export async function getWeeklyAggregations() {
  const result = await sql`
    SELECT
      date::text as date,
      SUM(weekly_sales) as total_sales,
      COUNT(DISTINCT store) as store_count,
      MAX(is_holiday::int)::boolean as is_holiday
    FROM sales
    GROUP BY date
    ORDER BY date
  `;
  return result;
}

export async function getStoreAggregations() {
  const result = await sql`
    SELECT
      s.store,
      st.type,
      st.size,
      SUM(s.weekly_sales) as total_sales,
      AVG(s.weekly_sales) as avg_weekly_sales,
      COUNT(*) as transaction_count,
      STDDEV(s.weekly_sales) / NULLIF(AVG(s.weekly_sales), 0) * 100 as volatility,
      array_agg(DISTINCT s.dept ORDER BY s.dept) as departments
    FROM sales s
    LEFT JOIN stores st ON s.store = st.store
    GROUP BY s.store, st.type, st.size
    ORDER BY total_sales DESC
  `;
  return result;
}

export async function getDepartmentAggregations() {
  const result = await sql`
    SELECT
      dept,
      SUM(weekly_sales) as total_sales,
      AVG(weekly_sales) as avg_weekly_sales,
      COUNT(*) as transaction_count,
      COUNT(DISTINCT store) as store_count
    FROM sales
    GROUP BY dept
    ORDER BY total_sales DESC
  `;
  return result;
}

export async function getHolidayImpact() {
  const result = await sql`
    SELECT
      is_holiday,
      SUM(weekly_sales) as total_sales,
      COUNT(*) as count,
      AVG(weekly_sales) as avg_sales
    FROM sales
    GROUP BY is_holiday
  `;
  return result;
}

export async function getWeeklyWithFeatures() {
  const result = await sql`
    SELECT
      s.date::text as date,
      SUM(s.weekly_sales) as total_sales,
      AVG(f.temperature) as avg_temperature,
      AVG(f.fuel_price) as avg_fuel_price,
      AVG(f.unemployment) as avg_unemployment,
      AVG(f.cpi) as avg_cpi,
      MAX(s.is_holiday::int)::boolean as is_holiday
    FROM sales s
    LEFT JOIN features f ON s.store = f.store AND s.date = f.date
    GROUP BY s.date
    ORDER BY s.date
  `;
  return result;
}

export async function getStoreTypePerformance() {
  const result = await sql`
    SELECT
      st.type,
      COUNT(DISTINCT s.store) as store_count,
      SUM(s.weekly_sales) as total_sales,
      AVG(st.size) as avg_size,
      AVG(sub.volatility) as avg_volatility
    FROM sales s
    JOIN stores st ON s.store = st.store
    LEFT JOIN (
      SELECT
        store,
        STDDEV(weekly_sales) / NULLIF(AVG(weekly_sales), 0) * 100 as volatility
      FROM sales
      GROUP BY store
    ) sub ON s.store = sub.store
    GROUP BY st.type
    ORDER BY total_sales DESC
  `;
  return result;
}

export async function getTopWeeks(limit: number = 5) {
  const result = await sql`
    SELECT
      date::text as date,
      SUM(weekly_sales) as total_sales,
      MAX(is_holiday::int)::boolean as is_holiday
    FROM sales
    GROUP BY date
    ORDER BY total_sales DESC
    LIMIT ${limit}
  `;
  return result;
}

export async function getMonthlySales() {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const result = await sql`
    SELECT
      EXTRACT(MONTH FROM date)::int as month,
      SUM(weekly_sales) as total_sales,
      AVG(weekly_sales) as avg_sales,
      COUNT(*) as week_count
    FROM (
      SELECT date, SUM(weekly_sales) as weekly_sales
      FROM sales
      GROUP BY date
    ) weekly
    GROUP BY EXTRACT(MONTH FROM date)
    ORDER BY month
  `;
  return result.map((r) => ({
    month: r.month,
    monthName: monthNames[r.month - 1],
    totalSales: r.total_sales,
    avgSales: r.avg_sales,
    weekCount: r.week_count,
  }));
}

export async function getStoreVolatility() {
  const result = await sql`
    SELECT
      s.store,
      st.type,
      AVG(s.weekly_sales) as mean,
      STDDEV(s.weekly_sales) as std_dev,
      STDDEV(s.weekly_sales) / NULLIF(AVG(s.weekly_sales), 0) * 100 as coefficient_of_variation
    FROM sales s
    LEFT JOIN stores st ON s.store = st.store
    GROUP BY s.store, st.type
    ORDER BY coefficient_of_variation DESC
    LIMIT 15
  `;
  return result.map((r) => ({
    store: r.store,
    type: r.type,
    mean: Number(r.mean),
    stdDev: Number(r.std_dev),
    coefficientOfVariation: Number(r.coefficient_of_variation),
    risk: Number(r.coefficient_of_variation) < 30 ? "low" : Number(r.coefficient_of_variation) < 50 ? "medium" : "high",
  }));
}

// Get risk counts separately (fast query)
export async function getRiskCounts() {
  const result = await sql`
    WITH store_volatility AS (
      SELECT
        s.store,
        STDDEV(s.weekly_sales) / NULLIF(AVG(s.weekly_sales), 0) * 100 as cv
      FROM sales s
      GROUP BY s.store
    )
    SELECT
      SUM(CASE WHEN cv >= 50 THEN 1 ELSE 0 END) as high_risk,
      SUM(CASE WHEN cv >= 30 AND cv < 50 THEN 1 ELSE 0 END) as medium_risk,
      SUM(CASE WHEN cv < 30 THEN 1 ELSE 0 END) as low_risk
    FROM store_volatility
  `;
  return {
    highRisk: Number(result[0].high_risk) || 0,
    mediumRisk: Number(result[0].medium_risk) || 0,
    lowRisk: Number(result[0].low_risk) || 0,
  };
}

// Anomaly detection using standard deviation (faster than IQR with PERCENTILE_CONT)
export async function getAnomalies() {
  const result = await sql`
    WITH store_dept_stats AS (
      SELECT
        store,
        dept,
        AVG(weekly_sales) as mean,
        STDDEV(weekly_sales) as std_dev,
        COUNT(*) as cnt
      FROM sales
      GROUP BY store, dept
      HAVING COUNT(*) >= 10 AND STDDEV(weekly_sales) > 0
    )
    SELECT
      s.store,
      s.dept,
      s.date::text as date,
      s.weekly_sales as sales,
      CASE
        WHEN s.weekly_sales < (st.mean - 2 * st.std_dev) THEN 'low'
        ELSE 'high'
      END as type,
      ABS(s.weekly_sales - st.mean) / st.std_dev as deviation
    FROM sales s
    JOIN store_dept_stats st ON s.store = st.store AND s.dept = st.dept
    WHERE s.weekly_sales < (st.mean - 2 * st.std_dev)
       OR s.weekly_sales > (st.mean + 2 * st.std_dev)
    ORDER BY deviation DESC
    LIMIT 10
  `;
  return result;
}

// Simplified weekly anomalies using pre-computed weekly stats
export async function getWeeklyWithAnomalies() {
  const result = await sql`
    WITH weekly_totals AS (
      SELECT
        date,
        SUM(weekly_sales) as total_sales
      FROM sales
      GROUP BY date
    ),
    weekly_stats AS (
      SELECT
        AVG(total_sales) as mean,
        STDDEV(total_sales) as std_dev
      FROM weekly_totals
    ),
    anomaly_flags AS (
      SELECT
        wt.date,
        wt.total_sales,
        CASE
          WHEN wt.total_sales < (ws.mean - 1.5 * ws.std_dev) THEN true
          WHEN wt.total_sales > (ws.mean + 1.5 * ws.std_dev) THEN true
          ELSE false
        END as is_anomaly,
        CASE
          WHEN wt.total_sales > (ws.mean + 1.5 * ws.std_dev) THEN 'high'
          WHEN wt.total_sales < (ws.mean - 1.5 * ws.std_dev) THEN 'low'
          ELSE NULL
        END as anomaly_type,
        CASE
          WHEN wt.total_sales < (ws.mean - 1.5 * ws.std_dev) OR wt.total_sales > (ws.mean + 1.5 * ws.std_dev)
          THEN ROUND(ABS(wt.total_sales - ws.mean) / ws.std_dev)::int
          ELSE 0
        END as anomaly_count
      FROM weekly_totals wt
      CROSS JOIN weekly_stats ws
    )
    SELECT
      date::text as date,
      total_sales,
      is_anomaly,
      anomaly_type,
      anomaly_count
    FROM anomaly_flags
    ORDER BY date
  `;
  return result;
}

export async function getWeekOverWeekAlerts(threshold: number = -20) {
  const result = await sql`
    WITH store_weekly AS (
      SELECT
        store,
        date,
        SUM(weekly_sales) as total_sales
      FROM sales
      GROUP BY store, date
    ),
    with_lag AS (
      SELECT
        store,
        date::text as date,
        total_sales as current_sales,
        LAG(date) OVER (PARTITION BY store ORDER BY date)::text as previous_date,
        LAG(total_sales) OVER (PARTITION BY store ORDER BY date) as previous_sales
      FROM store_weekly
    )
    SELECT
      store,
      date,
      previous_date,
      current_sales,
      previous_sales,
      ((current_sales - previous_sales) / NULLIF(previous_sales, 0) * 100) as change_percent
    FROM with_lag
    WHERE previous_sales > 0
      AND ((current_sales - previous_sales) / NULLIF(previous_sales, 0) * 100) <= ${threshold}
    ORDER BY change_percent
    LIMIT 15
  `;
  return result;
}
