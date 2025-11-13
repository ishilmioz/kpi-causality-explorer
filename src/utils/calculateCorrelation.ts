import type {
  GeneratedDataset,
  KpiKey,
  DriverKey,
  CorrelationResult,
  ScenarioInputs,
  SegmentedKpiSeries,
} from "../types/domain";


function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n !== ys.length || n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  let sumXY = 0;

  for (let i = 0; i < n; i++) {
    const x = xs[i];
    const y = ys[i];

    sumX += x;
    sumY += y;
    sumX2 += x * x;
    sumY2 += y * y;
    sumXY += x * y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  const cov = sumXY / n - meanX * meanY;
  const varX = sumX2 / n - meanX * meanX;
  const varY = sumY2 / n - meanY * meanY;

  if (varX <= 0 || varY <= 0) {
    return 0; 
  }

  const stdX = Math.sqrt(varX);
  const stdY = Math.sqrt(varY);

  return cov / (stdX * stdY);
}


function getKpiSeriesForAllSegments(
  dataset: GeneratedDataset,
  kpi: KpiKey
): SegmentedKpiSeries[] {
  return dataset.series.filter((s) => s.kpi === kpi);
}

function buildAggregatedKpiSeries(
  dataset: GeneratedDataset,
  kpi: KpiKey
): number[] {
  const series = getKpiSeriesForAllSegments(dataset, kpi);
  if (series.length === 0) return [];

  const length = series[0].points.length;
  const result: number[] = new Array(length).fill(0);

  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (const seg of series) {
      sum += seg.points[i].value;
    }
    result[i] = sum / series.length;
  }

  return result;
}

function temporalPatternForDriver(
  driver: DriverKey,
  t: number,
  total: number
): number {
  const progress = total > 1 ? t / (total - 1) : 0;

  if (driver === "campaign_intensity") {
    return 1 - 0.7 * progress;
  }

  return 1;
}

function buildDriverSeriesForKpi(
  driver: DriverKey,
  scenario: ScenarioInputs,
  length: number
): number[] {
  const arr = new Array(length).fill(0);

  let base = 0;
  if (driver === "campaign_intensity") {
    base = (scenario.campaign_intensity - 50) / 50;
  } else if (driver === "feature_toggle") {
    base = scenario.feature_toggle ? 1 : 0;
  } else {
    base = (scenario[driver] as number) / 100;
  }

  for (let i = 0; i < length; i++) {
    const p = i / (length - 1);

    switch (driver) {
      case "latency_change":
        arr[i] = base * p;
        break;

      case "crash_rate_change":
        arr[i] = base * (1 - p);
        break;

      case "traffic_change":
        arr[i] = base * Math.abs(p - 0.5);
        break;

      case "price_change":
        arr[i] = base * (1 - Math.abs(p - 0.5));
        break;

      case "campaign_intensity":
        arr[i] = base * Math.exp(-3 * p);
        break;

      case "feature_toggle":
        arr[i] = i > length / 2 ? base : 0;
        break;
    }
  }

  return arr;
}





export interface CorrelationEngineOptions {
  drivers?: DriverKey[]; 
}

export function calculateCorrelations(
  dataset: GeneratedDataset,
  scenario: ScenarioInputs,
  options: CorrelationEngineOptions = {}
): CorrelationResult[] {
  const results: CorrelationResult[] = [];

  const drivers: DriverKey[] =
    options.drivers ??
    ([
      "latency_change",
      "crash_rate_change",
      "traffic_change",
      "price_change",
      "campaign_intensity",
      "feature_toggle",
    ] as DriverKey[]);

  for (const kpi of dataset.kpis) {
    const kpiSeries = buildAggregatedKpiSeries(dataset, kpi);
    if (kpiSeries.length < 2) continue;

    const length = kpiSeries.length;

    for (const driver of drivers) {
    const driverSeries = buildDriverSeriesForKpi(
    driver,
    scenario,
    length
);

      const corr = pearsonCorrelation(driverSeries, kpiSeries);

      results.push({
        kpi,
        driver,
        correlation: corr,
      });
    }
  }

  return results;
}
