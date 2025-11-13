import type {
  GeneratedDataset,
  ScenarioInputs,
  CorrelationResult,
  DeltaResult,
  CausalityResult,
  DriverKey,
  KpiKey,
} from "../types/domain";

function getAnomalyThreshold(kpi: KpiKey): number {
  switch (kpi) {
    case "conversion_rate":
    case "churn_rate":
      return 0.05; // %5
    case "revenue":
    case "DAU":
      return 0.1; // %10
  }
}

function getDriverRelevance(driver: DriverKey): number {
  switch (driver) {
    case "latency_change":
    case "crash_rate_change":
    case "traffic_change":
      return 1.0;
    case "price_change":
      return 0.9;
    case "campaign_intensity":
      return 0.8;
    case "feature_toggle":
      return 0.6;
    default:
      return 0.8;
  }
}

function getDriverMagnitudeWeight(
  driver: DriverKey,
  scenario: ScenarioInputs
): number {
  let mag = 0;

  switch (driver) {
    case "campaign_intensity": {
      mag = Math.min(
        1,
        Math.abs(scenario.campaign_intensity - 50) / 50
      );
      break;
    }
    case "feature_toggle": {
      mag = scenario.feature_toggle ? 1 : 0;
      break;
    }
    default: {
      const raw = scenario[driver] as number; 
      mag = Math.min(1, Math.abs(raw) / 50);
      break;
    }
  }

  return mag; 
}


function buildDeltaMap(deltas: DeltaResult[]): Map<KpiKey, DeltaResult> {
  const map = new Map<KpiKey, DeltaResult>();
  for (const d of deltas) {
    map.set(d.kpi, d);
  }
  return map;
}

export interface CausalityEngineInput {
  dataset: GeneratedDataset;       
  scenario: ScenarioInputs;      
  correlations: CorrelationResult[];
  deltas: DeltaResult[];
}

export function calculateCausalityScores({
  dataset,
  scenario,
  correlations,
  deltas,
}: CausalityEngineInput): CausalityResult[] {
  const deltaMap = buildDeltaMap(deltas);

  const byKpi: Map<KpiKey, CausalityResult[]> = new Map();

for (const corr of correlations) {
  const { kpi, driver } = corr;
  const absCorr = Math.abs(corr.correlation);

  const deltaInfo = deltaMap.get(kpi);
  const relDelta = deltaInfo?.delta ?? 0;
  const threshold = getAnomalyThreshold(kpi);

  const deltaScore =
    threshold === 0 ? 0 : Math.min(1, Math.abs(relDelta) / threshold);

  const anomalyBoost = deltaInfo?.isAnomaly ? 1.2 : 1.0;

  const relevanceWeight = getDriverRelevance(driver);
  const magnitudeWeight = getDriverMagnitudeWeight(driver, scenario);

  const rawScore =
    absCorr *
    (0.5 + 0.5 * deltaScore) *
    relevanceWeight *
    magnitudeWeight *
    anomalyBoost;

  const kpiList = byKpi.get(kpi) ?? [];
  kpiList.push({
    kpi,
    driver,
    segmentId: undefined,
    causality_score: rawScore,
    contribution_estimate: 0,
  });
  byKpi.set(kpi, kpiList);
}


  const finalResults: CausalityResult[] = [];

  for (const [kpi, list] of byKpi.entries()) {
    if (list.length === 0) continue;

    const maxScore = list.reduce(
      (max, item) => (item.causality_score > max ? item.causality_score : max),
      0
    );

    if (maxScore === 0) {
      finalResults.push(
        ...list.map((item) => ({
          ...item,
          causality_score: 0,
          contribution_estimate: 0,
        }))
      );
      continue;
    }

    const normalized = list.map((item) => ({
      ...item,
      causality_score: item.causality_score / maxScore,
    }));

    const sumForContribution = normalized.reduce(
      (sum, item) => sum + item.causality_score,
      0
    );

    const withContribution = normalized.map((item) => ({
      ...item,
      contribution_estimate:
        sumForContribution === 0
          ? 0
          : item.causality_score / sumForContribution,
    }));

    finalResults.push(...withContribution);
  }

  return finalResults;
}
