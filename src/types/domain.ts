export type KpiKey = "conversion_rate" | "revenue" | "churn_rate" | "DAU";

export interface KpiDefinition {
  key: KpiKey;
  label: string;
  format: "percent" | "currency" | "integer";
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  { key: "conversion_rate", label: "Conversion Rate", format: "percent" },
  { key: "revenue", label: "Revenue", format: "currency" },
  { key: "churn_rate", label: "Churn Rate", format: "percent" },
  { key: "DAU", label: "Daily Active Users", format: "integer" },
];


export type Platform = "ios" | "android" | "web";
export type UserType = "new" | "returning";

export interface Segment {
  id: string; 
  platform: Platform;
  userType: UserType;
}

export const SEGMENTS: Segment[] = [
  { id: "ios_new", platform: "ios", userType: "new" },
  { id: "ios_returning", platform: "ios", userType: "returning" },
  { id: "android_new", platform: "android", userType: "new" },
  { id: "android_returning", platform: "android", userType: "returning" },
  { id: "web_new", platform: "web", userType: "new" },
  { id: "web_returning", platform: "web", userType: "returning" },
];


export interface ScenarioInputs {
  latency_change: number;
  crash_rate_change: number;     
  traffic_change: number;         
  price_change: number;          
  campaign_intensity: number;    
  platform_distribution: {
    ios: number;                 
    android: number;
    web: number;
  };
  feature_toggle: boolean;       
}

export const DEFAULT_SCENARIO: ScenarioInputs = {
  latency_change: 0,
  crash_rate_change: 0,
  traffic_change: 0,
  price_change: 0,
  campaign_intensity: 50,
  platform_distribution: {
    ios: 40,
    android: 40,
    web: 20,
  },
  feature_toggle: false,
};


export interface TimeSeriesPoint {
  date: string; 
  value: number;
}

export interface SegmentedKpiSeries {
  kpi: KpiKey;
  segmentId: string; 
  points: TimeSeriesPoint[];
}

export interface GeneratedDataset {
  kpis: KpiKey[];
  segments: Segment[];
  series: SegmentedKpiSeries[];
}


export type DriverKey = keyof ScenarioInputs;

export interface CorrelationResult {
  kpi: KpiKey;
  driver: DriverKey;
  segmentId?: string;
  correlation: number; 
  pValue?: number;
}

export interface DeltaWindow {
  startDate: string;
  endDate: string;
  avgValue: number;
}

export interface DeltaResult {
  kpi: KpiKey;
  segmentId?: string;
  lastWindow: DeltaWindow;
  prevWindow: DeltaWindow;
  delta: number;      
  isAnomaly: boolean;
}

export interface CausalityResult {
  kpi: KpiKey;
  driver: DriverKey;
  segmentId?: string;
  causality_score: number;        
  contribution_estimate: number;  
}


export interface InsightPayload {
  kpi: KpiKey;
  kpiTrendSummary: string;
  topDrivers: CausalityResult[];
  segmentHighlights: string[];   
  anomalies: DeltaResult[];
}

export interface InsightResult {
  kpi: KpiKey;
  text: string;                  
  createdAt: string;
}


export interface ScenarioState {
  inputs: ScenarioInputs;
  setInput: <K extends keyof ScenarioInputs>(
    key: K,
    value: ScenarioInputs[K]
  ) => void;
  reset: () => void;
}

export interface KpiState {
  selectedKpi: KpiKey;
  dataset?: GeneratedDataset;
  correlations: CorrelationResult[];
  deltas: DeltaResult[];
  causality: CausalityResult[];
  insights?: InsightResult;

  setSelectedKpi: (kpi: KpiKey) => void;
  setDataset: (data: GeneratedDataset) => void;
  setAnalytics: (args: {
    correlations: CorrelationResult[];
    deltas: DeltaResult[];
    causality: CausalityResult[];
  }) => void;
  setInsights: (insights: InsightResult) => void;
}
