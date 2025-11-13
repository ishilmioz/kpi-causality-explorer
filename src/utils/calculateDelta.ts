import type {
  GeneratedDataset,
  KpiKey,
  DeltaResult,
  DeltaWindow,
} from "../types/domain";

function buildAggregatedKpiSeries(
  dataset: GeneratedDataset,
  kpi: KpiKey
): number[] {
  const series = dataset.series.filter((s) => s.kpi === kpi);
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

function computeWindowAvg(
  values: number[],
  startIndex: number,
  windowSize: number
): number {
  let sum = 0;
  for (let i = startIndex; i < startIndex + windowSize; i++) {
    sum += values[i];
  }
  return sum / windowSize;
}

function getAnomalyThreshold(kpi: KpiKey): number {
  switch (kpi) {
    case "conversion_rate":
    case "churn_rate":
      return 0.05; 
    case "revenue":
    case "DAU":
      return 0.1; 
  }
}

export function calculateDeltas(
  dataset: GeneratedDataset
): DeltaResult[] {
  const results: DeltaResult[] = [];

  const anySeries = dataset.series[0];
  if (!anySeries) return results;

  const totalLength = anySeries.points.length;
  const windowSize = 7;

  if (totalLength < windowSize * 2) {
    return results;
  }

  const lastStart = totalLength - windowSize;
  const prevStart = totalLength - windowSize * 2;

  const lastStartDate = anySeries.points[lastStart].date;
  const lastEndDate = anySeries.points[totalLength - 1].date;
  const prevStartDate = anySeries.points[prevStart].date;
  const prevEndDate = anySeries.points[lastStart - 1].date;

  for (const kpi of dataset.kpis) {
    const seriesValues = buildAggregatedKpiSeries(dataset, kpi);
    if (seriesValues.length < totalLength) continue;

    const prevAvg = computeWindowAvg(seriesValues, prevStart, windowSize);
    const lastAvg = computeWindowAvg(seriesValues, lastStart, windowSize);

    const rawDelta = lastAvg - prevAvg;
    const relDelta =
      prevAvg === 0 ? 0 : rawDelta / prevAvg; 

    const threshold = getAnomalyThreshold(kpi);
    const isAnomaly = Math.abs(relDelta) >= threshold;

    const lastWindow: DeltaWindow = {
      startDate: lastStartDate,
      endDate: lastEndDate,
      avgValue: lastAvg,
    };

    const prevWindow: DeltaWindow = {
      startDate: prevStartDate,
      endDate: prevEndDate,
      avgValue: prevAvg,
    };

    results.push({
      kpi,
      segmentId: undefined, 
      lastWindow,
      prevWindow,
      delta: relDelta, 
      isAnomaly,
    });
  }

  return results;
}
