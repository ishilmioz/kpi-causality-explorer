import type {
  KpiKey,
  Segment,
  GeneratedDataset,
  TimeSeriesPoint,
  SegmentedKpiSeries,
  ScenarioInputs,
  DriverKey,
} from "../types/domain";
import { KPI_DEFINITIONS, SEGMENTS } from "../types/domain";


export interface GenerateOptions {
  days?: number;     
  startDate?: string;
  seed?: number;     
}


const KPI_KEYS: KpiKey[] = KPI_DEFINITIONS.map((k) => k.key);

const KPI_BASELINE_RANGE: Record<KpiKey, { min: number; max: number }> = {
  conversion_rate: { min: 0.04, max: 0.10 },
  revenue: { min: 20000, max: 80000 },
  churn_rate: { min: 0.03, max: 0.12 },
  DAU: { min: 5000, max: 50000 },
};

const SEGMENT_MODIFIERS: Record<string, number> = {
  ios_new: 1.0,
  ios_returning: 1.05,
  android_new: 1.1,
  android_returning: 1.15,
  web_new: 0.9,
  web_returning: 0.95,
};

type SensitivityConfig = {
  [kpi in KpiKey]: {
    [driver in DriverKey]?: number; 
  };
};


const SENSITIVITY: SensitivityConfig = {
  conversion_rate: {
    latency_change: -1.2,       
    crash_rate_change: -0.8,     
    traffic_change: 0.25,        
    price_change: -0.6,          
    campaign_intensity: 0.35, 
  },
  revenue: {
    latency_change: -0.5,
    traffic_change: 1.2,
    price_change: 0.9,
    campaign_intensity: 0.6,
  },
  churn_rate: {
    latency_change: 0.7,
    crash_rate_change: 0.9,
    price_change: 0.4,
  },
  DAU: {
    traffic_change: 1.1,
    campaign_intensity: 0.9,
    crash_rate_change: -0.6,
  },
};


const DRIVER_SEGMENT_MULTIPLIER: Partial<
  Record<DriverKey, Partial<Record<string, number>>>
> = {
  latency_change: {
    android_new: 1.3,
    android_returning: 1.3,
    ios_new: 1.1,
    ios_returning: 1.1,
  },
  campaign_intensity: {
    ios_new: 1.2,
    android_new: 1.2,
    web_new: 1.1,
  },
  price_change: {
    ios_returning: 1.2,
    android_returning: 1.2,
    web_returning: 1.2,
  },
};


function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10); 
}

function buildDateRange(
  days: number,
  startDate?: string
): { dates: string[]; startDate: string } {
  const dates: string[] = [];
  let start: Date;

  if (startDate) {
    start = new Date(startDate);
  } else {
    const today = new Date();
    // today - (days - 1)
    start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
  }

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(toIsoDate(d));
  }

  return { dates, startDate: toIsoDate(start) };
}

function getRandomBaseline(kpi: KpiKey): number {
  const range = KPI_BASELINE_RANGE[kpi];
  return randomBetween(range.min, range.max);
}

function getSegmentBaseline(
  segment: Segment,
  globalBaseline: number
): number {
  const modifier = SEGMENT_MODIFIERS[segment.id] ?? 1;
  return globalBaseline * modifier;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function addNoise(kpi: KpiKey, value: number): number {
  const noiseLevel =
    kpi === "revenue" || kpi === "DAU" ? 0.05 : 0.02;
  const noise = (Math.random() - 0.5) * 2 * value * noiseLevel;
  return value + noise;
}

function postProcessKpiValue(kpi: KpiKey, value: number): number {
  switch (kpi) {
    case "conversion_rate":
    case "churn_rate": {
      const clamped = clamp(value, 0, 1);
      return Number(clamped.toFixed(4));
    }
    case "DAU": {
      return Math.max(Math.round(value), 0);
    }
    case "revenue": {
      return Math.max(Math.round(value), 0);
    }
  }
}


interface GenerateSeriesArgs {
  kpi: KpiKey;
  segment: Segment;
  baseline: number;
  dates: string[];
  scenario: ScenarioInputs;
  totalDays: number;
}

function computeTrendFactor(kpi: KpiKey, t: number, totalDays: number): number {
  const progress = t / Math.max(totalDays - 1, 1); // 0..1

  switch (kpi) {
    case "conversion_rate":
      // Çok hafif uzun dönem iyileşme
      return 0.015 * progress; // ~%1.5
    case "revenue":
      // Revenue biraz daha trendli gidebilir
      return 0.04 * progress; // ~%4
    case "churn_rate":
      // Hafif iyileşme (düşüş)
      return -0.01 * progress; // ~%1
    case "DAU":
      return 0.05 * progress; // ~%5
  }
}

function computeSeasonalityFactor(t: number): number {
  // Haftalık seasonality, ama hafif
  return 0.01 * Math.sin((2 * Math.PI * t) / 7);
}



interface DriverEffectArgs {
  kpi: KpiKey;
  segment: Segment;
  scenario: ScenarioInputs;
  t: number;
  totalDays: number;
}

function computeTemporalFactor(
  driver: DriverKey,
  t: number,
  totalDays: number
): number {
  if (driver === "campaign_intensity") {
    const progress = t / Math.max(totalDays - 1, 1);
    return 1 - 0.7 * progress;
  }

  return 1;
}

function computeDriverEffect({
  kpi,
  segment,
  scenario,
  t,
  totalDays,
}: DriverEffectArgs): number {
  const baseSensitivity = SENSITIVITY[kpi];
  if (!baseSensitivity) {
    return 0;
  }

  let total = 0;

  (Object.keys(baseSensitivity) as DriverKey[]).forEach((driver) => {
    const sensitivity = baseSensitivity[driver] ?? 0;

    let rawValue = 0;

    if (driver === "campaign_intensity") {
      rawValue = (scenario.campaign_intensity - 50) / 50;
    } else if (driver === "feature_toggle") {
      return;
    } else {
   
      const numericScenarioValue = scenario[driver] as number;
      rawValue = numericScenarioValue / 100;
    }

    const segmentMultiplier =
      DRIVER_SEGMENT_MULTIPLIER[driver]?.[segment.id] ?? 1;

    const temporalFactor = computeTemporalFactor(driver, t, totalDays);

    total += sensitivity * rawValue * segmentMultiplier * temporalFactor;
  });

  if (scenario.feature_toggle) {
    if (kpi === "conversion_rate" && segment.platform === "android") {
      total += -0.05; // -5% civarı
    }
    if (kpi === "DAU" && segment.platform === "android") {
      total += 0.03; 
    }
  }

  return clamp(total, -0.5, 0.5);
}


function generateSeriesForSegmentKpi({
  kpi,
  segment,
  baseline,
  dates,
  scenario,
  totalDays,
}: GenerateSeriesArgs): TimeSeriesPoint[] {
  return dates.map((date, index) => {
    const t = index;

    const trendFactor = computeTrendFactor(kpi, t, totalDays);
    const seasonalityFactor = computeSeasonalityFactor(t);
    const driverFactor = computeDriverEffect({
      kpi,
      segment,
      scenario,
      t,
      totalDays,
    });

    // Additive yaklaşım: trend + seasonality + driver birlikte çalışıyor
    let combinedFactor = 1 + trendFactor + seasonalityFactor + driverFactor;

    // Çok saçma negatif/çok düşük değerleri kes
    combinedFactor = clamp(combinedFactor, 0.2, 3);

    const baseValue = baseline * combinedFactor;

    const noisyValue = addNoise(kpi, baseValue);

    return {
      date,
      value: postProcessKpiValue(kpi, noisyValue),
    };
  });
} 

export function generateDataset(
  scenario: ScenarioInputs,
  options: GenerateOptions = {}
): GeneratedDataset {
  const days = options.days ?? 60;

  const { dates } = buildDateRange(days, options.startDate);

  const kpis = KPI_KEYS;
  const segments = SEGMENTS;

  const series: SegmentedKpiSeries[] = [];

  for (const kpi of kpis) {
    const globalBaseline = getRandomBaseline(kpi);

    for (const segment of segments) {
      const segmentBaseline = getSegmentBaseline(segment, globalBaseline);

      const points = generateSeriesForSegmentKpi({
        kpi,
        segment,
        baseline: segmentBaseline,
        dates,
        scenario,
        totalDays: days,
      });

      series.push({
        kpi,
        segmentId: segment.id,
        points,
      });
    }
  }

  return {
    kpis,
    segments,
    series,
  };
}

export const __datasetConfig = {
  KPI_KEYS,
  KPI_BASELINE_RANGE,
  SEGMENT_MODIFIERS,
  SENSITIVITY,
  DRIVER_SEGMENT_MULTIPLIER,
  SEGMENTS,
};
