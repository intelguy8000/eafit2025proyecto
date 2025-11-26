# Walmart Analytics Dashboard

Dashboard de análisis de datos de ventas de Walmart para proyecto EAFIT 2025.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Base de datos**: Neon Postgres (`@neondatabase/serverless`)
- **Visualización**: Recharts
- **Estilos**: Tailwind CSS
- **Deploy**: Vercel

## Estructura del Proyecto

```
walmart-analytics/
├── app/
│   ├── api/data/route.ts    # API endpoint principal
│   ├── page.tsx             # Dashboard principal
│   └── globals.css          # Estilos globales
├── components/
│   ├── charts/              # Componentes de gráficas
│   │   ├── ForecastChart.tsx
│   │   ├── SalesAreaChart.tsx
│   │   ├── TopStoresChart.tsx
│   │   └── ...
│   ├── PredictionSection.tsx
│   ├── Scorecard.tsx
│   └── ...
├── lib/
│   ├── db.ts                # Queries a la base de datos
│   ├── data.ts              # Utilidades de formato
│   └── prediction.ts        # Modelo predictivo
└── scripts/
    └── seed.ts              # Script de carga de datos
```

## Configuración

### Variables de Entorno

```env
DATABASE_URL=postgresql://...  # URL de conexión a Neon Postgres
```

### Instalación

```bash
npm install
npm run dev
```

### Cargar Datos

```bash
npm run seed
```

---

## Modelo Predictivo

El dashboard incluye un modelo de pronóstico de ventas implementado en `lib/prediction.ts`.

### Arquitectura del Modelo

**Nombre**: Holt-Winters Simplificado con Regresión Lineal

El modelo combina tres componentes:

1. **Nivel Base**: Promedio de las últimas 4 semanas (suavizado)
2. **Tendencia**: Regresión lineal sobre los datos históricos
3. **Estacionalidad**: Índices mensuales calculados como ratio vs promedio general
4. **Factor Festivo**: Ratio de ventas en semanas festivas vs normales

### Fórmula de Predicción

```
Predicción = (BasePrediction × 0.7) + (TrendComponent × 0.3)

donde:
  BasePrediction = BaseLevel × SeasonalIndex × HolidayFactor
  TrendComponent = Intercept + (Slope × WeekNumber)
```

### Variables de Entrada

| Variable | Descripción |
|----------|-------------|
| `totalSales` | Ventas semanales históricas (agregado de todas las tiendas) |
| `date` | Fecha de la semana |
| `isHoliday` | Indicador de semana festiva (Super Bowl, Labor Day, Thanksgiving, Christmas) |

### Semanas Festivas Consideradas

```typescript
const HOLIDAY_WEEKS = [
  { month: 2, week: 2 },   // Super Bowl
  { month: 9, week: 1 },   // Labor Day
  { month: 11, week: 4 },  // Thanksgiving
  { month: 12, week: 4 },  // Christmas
];
```

### Métricas de Evaluación

El modelo se evalúa usando validación hold-out (80% entrenamiento, 20% validación):

| Métrica | Descripción | Interpretación |
|---------|-------------|----------------|
| **MAE** | Error Absoluto Medio | Diferencia promedio en dólares entre predicción y real |
| **MAPE** | Error Porcentual Absoluto Medio | Error como % del valor real. <5% = alta precisión |
| **R²** | Coeficiente de Determinación | 1.0 = perfecto, 0 = no explica variabilidad |

### Bandas de Confianza

Las predicciones incluyen un intervalo de confianza de ±10%:

```typescript
lowerBound = predictedSales × 0.90
upperBound = predictedSales × 1.10
```

### Supuestos del Modelo

1. Estacionalidad mensual constante (los patrones se repiten cada año)
2. Tendencia lineal en el tiempo
3. Impacto festivo proporcional al promedio histórico
4. Patrones pasados se repiten en el futuro

### Limitaciones

1. **No considera factores macroeconómicos**: inflación, desempleo, CPI
2. **No incluye eventos externos**: competencia, promociones especiales, apertura/cierre de tiendas
3. **Asume continuidad operativa**: no modela cierres temporales o permanentes
4. **Precisión decreciente**: a mayor horizonte de predicción, menor confiabilidad

### Uso Programático

```typescript
import { generateForecast, prepareChartData, WeeklyDataPoint } from '@/lib/prediction';

// Preparar datos de entrada
const historicalData: WeeklyDataPoint[] = weeklyAggregations.map(w => ({
  date: w.date,
  totalSales: w.totalSales,
  isHoliday: w.isHoliday,
}));

// Generar pronóstico (12 semanas por defecto)
const forecast = generateForecast(historicalData, 12);

// Acceder a resultados
console.log(forecast.predictions);  // Array de predicciones semanales
console.log(forecast.metrics);      // MAE, MAPE, R², confidenceScore
console.log(forecast.methodology);  // Info del modelo
console.log(forecast.summary);      // Resumen ejecutivo

// Preparar datos para gráfica
const chartData = prepareChartData(historicalData, forecast.predictions, 52);
```

### Interfaces TypeScript

```typescript
interface WeeklyDataPoint {
  date: string;
  totalSales: number;
  isHoliday: boolean;
}

interface PredictionResult {
  date: string;
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  isHoliday: boolean;
  weekNumber: number;
}

interface ForecastOutput {
  predictions: PredictionResult[];
  metrics: ModelMetrics;
  methodology: MethodologyInfo;
  summary: ForecastSummary;
}
```

### Posibles Mejoras Futuras

1. **SARIMA/Prophet**: Modelos más sofisticados para series de tiempo
2. **Variables exógenas**: Incorporar temperatura, precio de gasolina, desempleo
3. **Predicción por tienda/departamento**: Modelos granulares
4. **Ensemble**: Combinar múltiples modelos
5. **Actualización automática**: Re-entrenar con datos nuevos

---

## Cálculo de Volatilidad

La volatilidad se calcula como el coeficiente de variación de las ventas semanales agregadas por tienda:

```sql
volatility = STDDEV(weekly_total_sales) / AVG(weekly_total_sales) * 100
```

### Clasificación de Riesgo

| Nivel | Volatilidad | Descripción |
|-------|-------------|-------------|
| Alto | >25% | Ventas muy impredecibles |
| Medio | 15-25% | Variabilidad moderada |
| Bajo | <15% | Ventas estables |

---

## API Endpoint

### GET /api/data

Retorna todos los datos del dashboard en una sola llamada:

```json
{
  "kpis": { ... },
  "storeAggregations": [ ... ],
  "departmentAggregations": [ ... ],
  "weeklyAggregations": [ ... ],
  "anomalies": [ ... ],
  "forecast": {
    "predictions": [ ... ],
    "metrics": { "mae": 1100000, "mape": 2.3, "r2": 0.237, "confidenceScore": 97.7 },
    "methodology": { ... },
    "summary": { ... }
  }
}
```

---

## Deploy

El proyecto está configurado para deploy automático en Vercel:

```bash
git push origin main  # Trigger deploy automático
```

URL de producción: https://walmart-analytics.vercel.app

---

## Licencia

Proyecto académico - EAFIT 2025
