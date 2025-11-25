import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const connectionString = process.env.STORAGE_DATABASE_URL;

if (!connectionString) {
  throw new Error("STORAGE_DATABASE_URL is not set. Run with: npx dotenv-cli -e .env.local -- npx tsx scripts/seed.ts");
}

const sql = neon(connectionString);

// =============================================================================
// CREATE TABLES
// =============================================================================

async function createTables() {
  console.log("Creating tables...");

  await sql`DROP TABLE IF EXISTS sales CASCADE`;
  await sql`DROP TABLE IF EXISTS features CASCADE`;
  await sql`DROP TABLE IF EXISTS stores CASCADE`;

  await sql`
    CREATE TABLE stores (
      store INT PRIMARY KEY,
      type VARCHAR(1) NOT NULL,
      size INT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE sales (
      id SERIAL PRIMARY KEY,
      store INT NOT NULL,
      dept INT NOT NULL,
      date DATE NOT NULL,
      weekly_sales DECIMAL(15,2) NOT NULL,
      is_holiday BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  await sql`
    CREATE TABLE features (
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

  console.log("Tables created successfully!");
}

async function createIndexes() {
  console.log("\nCreating indexes...");
  await sql`CREATE INDEX idx_sales_store ON sales(store)`;
  await sql`CREATE INDEX idx_sales_dept ON sales(dept)`;
  await sql`CREATE INDEX idx_sales_date ON sales(date)`;
  await sql`CREATE INDEX idx_features_store ON features(store)`;
  await sql`CREATE INDEX idx_features_date ON features(date)`;
  console.log("Indexes created!");
}

// =============================================================================
// PARSE CSV HELPERS
// =============================================================================

function parseCSV<T>(content: string): T[] {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data as T[];
}

function parseBoolean(value: string): boolean {
  return value?.toUpperCase() === "TRUE";
}

function parseNumber(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// =============================================================================
// SEED FUNCTIONS - Using batch inserts with VALUES
// =============================================================================

async function seedStores() {
  console.log("\nSeeding stores...");

  const csvPath = path.join(process.cwd(), "data", "stores.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV<{ Store: string; Type: string; Size: string }>(content);

  // Build VALUES clause
  const values = rows.map(
    (row) => `(${parseInt(row.Store)}, '${row.Type}', ${parseInt(row.Size)})`
  ).join(",\n");

  await sql.query(`INSERT INTO stores (store, type, size) VALUES ${values}`);

  console.log(`  Inserted ${rows.length} stores`);
}

async function seedFeatures() {
  console.log("\nSeeding features...");

  const csvPath = path.join(process.cwd(), "data", "features.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV<{
    Store: string;
    Date: string;
    Temperature: string;
    Fuel_Price: string;
    CPI: string;
    Unemployment: string;
    IsHoliday: string;
  }>(content);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const values = batch.map((row) => {
      const store = parseInt(row.Store);
      const date = row.Date;
      const temp = parseNumber(row.Temperature);
      const fuel = parseNumber(row.Fuel_Price);
      const cpi = parseNumber(row.CPI);
      const unemp = parseNumber(row.Unemployment);
      const holiday = parseBoolean(row.IsHoliday);
      return `(${store}, '${date}', ${temp}, ${fuel}, ${cpi}, ${unemp}, ${holiday})`;
    }).join(",\n");

    await sql.query(`
      INSERT INTO features (store, date, temperature, fuel_price, cpi, unemployment, is_holiday)
      VALUES ${values}
    `);

    inserted += batch.length;
    process.stdout.write(`  Progress: ${inserted}/${rows.length} features\r`);
  }

  console.log(`\n  Inserted ${inserted} features`);
}

async function seedSales() {
  console.log("\nSeeding sales (421K records - this will take a few minutes)...");

  const csvPath = path.join(process.cwd(), "data", "train.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV<{
    Store: string;
    Dept: string;
    Date: string;
    Weekly_Sales: string;
    IsHoliday: string;
  }>(content);

  const BATCH_SIZE = 2000;
  let inserted = 0;
  const totalRows = rows.length;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const values = batch.map((row) => {
      const store = parseInt(row.Store);
      const dept = parseInt(row.Dept);
      const date = row.Date;
      const sales = parseNumber(row.Weekly_Sales);
      const holiday = parseBoolean(row.IsHoliday);
      return `(${store}, ${dept}, '${date}', ${sales}, ${holiday})`;
    }).join(",\n");

    await sql.query(`
      INSERT INTO sales (store, dept, date, weekly_sales, is_holiday)
      VALUES ${values}
    `);

    inserted += batch.length;
    const percent = ((inserted / totalRows) * 100).toFixed(1);
    process.stdout.write(`  Progress: ${inserted.toLocaleString()}/${totalRows.toLocaleString()} (${percent}%)\r`);
  }

  console.log(`\n  Inserted ${inserted.toLocaleString()} sales records`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("WALMART ANALYTICS - DATABASE SEED");
  console.log("=".repeat(60));

  try {
    // Test connection
    console.log("\nTesting database connection...");
    const result = await sql`SELECT NOW() as now`;
    console.log(`  Connected! Server time: ${result[0].now}`);

    // Create tables (drops existing)
    await createTables();

    // Seed data
    await seedStores();
    await seedFeatures();
    await seedSales();

    // Create indexes after data load (faster)
    await createIndexes();

    console.log("\n" + "=".repeat(60));
    console.log("SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));

    // Show counts
    const storeCount = await sql`SELECT COUNT(*) as count FROM stores`;
    const featureCount = await sql`SELECT COUNT(*) as count FROM features`;
    const salesCount = await sql`SELECT COUNT(*) as count FROM sales`;

    console.log(`\nFinal counts:`);
    console.log(`  - Stores: ${storeCount[0].count}`);
    console.log(`  - Features: ${featureCount[0].count}`);
    console.log(`  - Sales: ${salesCount[0].count}`);
  } catch (error) {
    console.error("\nError during seed:", error);
    process.exit(1);
  }
}

main();
