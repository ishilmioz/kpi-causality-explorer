import { useKpiStore } from "../state/useKpiStore";
import { KPI_DEFINITIONS } from "../types/domain";

const DRIVER_LABELS: Record<string, string> = {
  latency_change: "Latency Change",
  crash_rate_change: "Crash Rate Change",
  traffic_change: "Traffic Change",
  price_change: "Price Change",
  campaign_intensity: "Campaign Intensity",
  feature_toggle: "Feature Toggle",
};

export function Causality() {
  const { selectedKpi, correlations, deltas, causality } = useKpiStore();

  const selectedKpiDef = KPI_DEFINITIONS.find((k) => k.key === selectedKpi);

  const filtered = correlations
    .filter((c) => c.kpi === selectedKpi)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  return (
    <div>
      <h1>Causality / Correlation View</h1>

      <p>
        Selected KPI:{" "}
        <strong>{selectedKpiDef ? selectedKpiDef.label : selectedKpi}</strong>
      </p>

      {filtered.length === 0 ? (
        <p>No correlation data yet. Go to Scenarios and click "Generate Data".</p>
      ) : (
        <table
          style={{
            marginTop: "16px",
            borderCollapse: "collapse",
            minWidth: "400px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                Driver
              </th>
              <th
                style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}
              >
                Correlation
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={`${row.kpi}-${row.driver}`}>
                <td
                  style={{
                    padding: "4px 8px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {DRIVER_LABELS[row.driver] ?? row.driver}
                </td>
                <td
                  style={{
                    padding: "4px 8px",
                    borderBottom: "1px solid #eee",
                    textAlign: "right",
                  }}
                >
                  {row.correlation.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section style={{ marginTop: "24px" }}>
        <h2>Delta (Last 7 vs Previous 7)</h2>

        {deltas.length === 0 ? (
          <p>No delta data yet.</p>
        ) : (
          (() => {
            const deltaForKpi = deltas.find((d) => d.kpi === selectedKpi);

            if (!deltaForKpi) {
              return <p>No delta found for this KPI.</p>;
            }

            const { lastWindow, prevWindow, delta, isAnomaly } = deltaForKpi;

            const percentChange = (delta * 100).toFixed(1);

            return (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                }}
              >
                <p>
                  Previous 7 days ({prevWindow.startDate} →{" "}
                  {prevWindow.endDate}):{" "}
                  <strong>{prevWindow.avgValue.toFixed(3)}</strong>
                </p>
                <p>
                  Last 7 days ({lastWindow.startDate} → {lastWindow.endDate}):{" "}
                  <strong>{lastWindow.avgValue.toFixed(3)}</strong>
                </p>
                <p>
                  Change:{" "}
                  <strong>
                    {percentChange}% {isAnomaly ? "(ANOMALY)" : ""}
                  </strong>
                </p>
              </div>
            );
          })()
        )}
      </section>

      {/* ---- Top Drivers by Causality Score ---- */}
      <section style={{ marginTop: "24px" }}>
        <h2>Top Drivers (Causality Score)</h2>

        {causality.length === 0 ? (
          <p>No causality data yet.</p>
        ) : (
          (() => {
            const listForKpi = causality
              .filter((c) => c.kpi === selectedKpi)
              .sort((a, b) => b.causality_score - a.causality_score);

            if (listForKpi.length === 0) {
              return <p>No causality scores for this KPI.</p>;
            }

            return (
              <table
                style={{
                  marginTop: "8px",
                  borderCollapse: "collapse",
                  minWidth: "400px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "left",
                      }}
                    >
                      Driver
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "right",
                      }}
                    >
                      Causality Score
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        textAlign: "right",
                      }}
                    >
                      Contribution
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listForKpi.map((row) => (
                    <tr key={`${row.kpi}-${row.driver}-cause`}>
                      <td
                        style={{
                          padding: "4px 8px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {DRIVER_LABELS[row.driver] ?? row.driver}
                      </td>
                      <td
                        style={{
                          padding: "4px 8px",
                          borderBottom: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        {row.causality_score.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "4px 8px",
                          borderBottom: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        {(row.contribution_estimate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()
        )}
      </section>
    </div>
  );
}
