import { create } from "zustand";
import type {
  KpiKey,
  KpiState,
  GeneratedDataset,
  CorrelationResult,
  DeltaResult,
  CausalityResult,
  InsightResult,
} from "../types/domain";

const DEFAULT_KPI: KpiKey = "conversion_rate";

export const useKpiStore = create<KpiState>((set) => ({
  selectedKpi: DEFAULT_KPI,
  dataset: undefined,
  correlations: [],
  deltas: [],
  causality: [],
  insights: undefined,

  setSelectedKpi: (kpi) =>
    set(() => ({
      selectedKpi: kpi,
    })),

  setDataset: (data: GeneratedDataset) =>
    set(() => ({
      dataset: data,
    })),

  setAnalytics: ({ correlations, deltas, causality }) =>
    set(() => ({
      correlations,
      deltas,
      causality,
    })),

  setInsights: (insights: InsightResult) =>
    set(() => ({
      insights,
    })),
}));
