import { useState } from "react";
import { useKpiStore } from "../state/useKpiStore";
import { KPI_DEFINITIONS } from "../types/domain";
import { generateInsightForKpi } from "../utils/aiExplain";

export function Insights() {
  const { selectedKpi, correlations, deltas, causality, insights, setInsights, dataset } =
    useKpiStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedKpiDef = KPI_DEFINITIONS.find((k) => k.key === selectedKpi);

  const handleGenerateInsight = async () => {
    if (!dataset) {
      setError("No dataset found. Go to Scenarios and click 'Generate Data' first.");
      return;
    }
    if (correlations.length === 0 || deltas.length === 0 || causality.length === 0) {
      setError(
        "Analytics results are missing. Make sure you've run 'Generate Data' and that correlations/deltas/causality are computed."
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const deltaForKpi = deltas.find((d) => d.kpi === selectedKpi) || null;

      let kpiTrendSummary = "No recent movement detected.";
      if (deltaForKpi) {
        const pct = (deltaForKpi.delta * 100).toFixed(1);
        const direction =
          deltaForKpi.delta > 0 ? "increased" : deltaForKpi.delta < 0 ? "decreased" : "stayed roughly flat";
        kpiTrendSummary = `Over the last 7 days versus the previous 7 days, the KPI has ${direction} by approximately ${pct}%.`;
      }

      const topDriversForKpi = causality
        .filter((c) => c.kpi === selectedKpi)
        .sort((a, b) => b.causality_score - a.causality_score)
        .slice(0, 5);

      const anomaliesForKpi = deltaForKpi && deltaForKpi.isAnomaly ? [deltaForKpi] : [];

      const segmentHighlights: string[] = [
        "Segment-level analysis is aggregated in this V1. In a real dataset, you would highlight which platforms or user types are most impacted.",
      ];

      const payload = {
        kpi: selectedKpi,
        kpiTrendSummary,
        topDrivers: topDriversForKpi,
        anomalies: anomaliesForKpi,
        segmentHighlights,
      };

      const result = await generateInsightForKpi(payload);

      setInsights(result);
    } catch (e) {
      console.error("[Insights] generateInsightForKpi error", e);
      setError("Failed to generate insight. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Insights</h1>

      <p>
        Selected KPI:{" "}
        <strong>{selectedKpiDef ? selectedKpiDef.label : selectedKpi}</strong>
      </p>

      <div style={{ marginTop: "16px", marginBottom: "16px" }}>
        <button
          onClick={handleGenerateInsight}
          disabled={loading}
          style={{
            padding: "8px 12px",
            border: "2px solid black",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : insights ? "Re-run Insight" : "Generate Insight"}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 12px",
            border: "1px solid red",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {!insights && !loading && !error && (
        <p>
          No insight generated yet. Click{" "}
          <strong>{`"${dataset ? "Generate Insight" : "Generate Data"}"`}</strong> to
          start.
        </p>
      )}

      {insights && !loading && (
        <div
          style={{
            padding: "12px 16px",
            border: "1px solid #ccc",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          {insights.text}
        </div>
      )}
    </div>
  );
}
