// src/pages/Dashboard.tsx

import { KPI_DEFINITIONS } from "../types/domain";
import { useKpiStore } from "../state/useKpiStore";
import { TrendChart } from "../charts/TrendChart";

export function Dashboard() {
  const { selectedKpi, setSelectedKpi, dataset, deltas } = useKpiStore();

  const selectedKpiDef = KPI_DEFINITIONS.find((k) => k.key === selectedKpi);

  // --------- Aggregated trend data for selected KPI ---------
  let chartData: { date: string; value: number }[] = [];

  if (dataset) {
    const allSeriesForKpi = dataset.series.filter((s) => s.kpi === selectedKpi);

    if (allSeriesForKpi.length > 0) {
      const length = allSeriesForKpi[0].points.length;

      chartData = new Array(length).fill(null).map((_, idx) => {
        const sum = allSeriesForKpi.reduce(
          (acc, s) => acc + s.points[idx].value,
          0
        );
        return {
          date: allSeriesForKpi[0].points[idx].date,
          value: sum / allSeriesForKpi.length,
        };
      });
    }
  }

  // --------- Last value & delta info for selected KPI ---------
  const lastValue =
    chartData.length > 0 ? chartData[chartData.length - 1].value : null;

  const deltaForKpi =
    deltas && deltas.length > 0
      ? deltas.find((d) => d.kpi === selectedKpi) || null
      : null;

  const percentChange =
    deltaForKpi && deltaForKpi.delta !== undefined
      ? (deltaForKpi.delta * 100).toFixed(1)
      : null;

  return (
    <div>
      <h1>Dashboard</h1>

      {/* KPI selector */}
      <section>
        <h2>Selected KPI</h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {KPI_DEFINITIONS.map((kpi) => (
            <button
              key={kpi.key}
              onClick={() => setSelectedKpi(kpi.key)}
              style={{
                padding: "4px 8px",
                border:
                  selectedKpi === kpi.key
                    ? "2px solid black"
                    : "1px solid #ccc",
                fontWeight: selectedKpi === kpi.key ? "bold" : "normal",
              }}
            >
              {kpi.label}
            </button>
          ))}
        </div>
        <p>
          Current selected KPI key:{" "}
          <strong>{selectedKpiDef ? selectedKpiDef.label : selectedKpi}</strong>
        </p>
      </section>

      {/* Dataset status */}
      <section style={{ marginTop: "16px" }}>
        <h2>Dataset Status</h2>
        {dataset ? (
          <div>
            <p>KPI count: {dataset.kpis.length}</p>
            <p>Segment count: {dataset.segments.length}</p>
            <p>Series count: {dataset.series.length}</p>
          </div>
        ) : (
          <p>No dataset generated yet.</p>
        )}
      </section>

      {/* Trend chart */}
      <section style={{ marginTop: "24px" }}>
        <h2>KPI Trend (Aggregated)</h2>
        {!dataset || chartData.length === 0 ? (
          <p>No trend data yet. Go to Scenarios and click “Generate Data”.</p>
        ) : (
          <TrendChart data={chartData} kpi={selectedKpi} />
        )}
      </section>

      {/* KPI Summary */}
      <section style={{ marginTop: "24px" }}>
        <h2>KPI Summary</h2>

        {!dataset || chartData.length === 0 ? (
          <p>No summary available yet.</p>
        ) : (
          <div
            style={{
              marginTop: "8px",
              padding: "12px 16px",
              border: "1px solid #ccc",
              display: "inline-block",
              minWidth: "260px",
            }}
          >
            <p>
              <strong>Latest value:</strong>{" "}
              {lastValue !== null ? lastValue.toFixed(3) : "N/A"}
            </p>

            {deltaForKpi ? (
              <>
                <p>
                  <strong>Last 7 vs Previous 7:</strong>{" "}
                  {percentChange}%{" "}
                  {deltaForKpi.isAnomaly ? "(ANOMALY)" : ""}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  Window: {deltaForKpi.lastWindow.startDate} →{" "}
                  {deltaForKpi.lastWindow.endDate}
                </p>
              </>
            ) : (
              <p>No delta info for this KPI.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
