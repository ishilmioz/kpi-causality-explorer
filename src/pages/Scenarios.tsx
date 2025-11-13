import { useScenarioStore } from "../state/useScenarioStore";
import { useKpiStore } from "../state/useKpiStore";
import { generateDataset } from "../utils/generateDataset";
import { calculateCorrelations } from "../utils/calculateCorrelation";
import { calculateDeltas } from "../utils/calculateDelta";
import { calculateCausalityScores } from "../utils/causalityModel";

export function Scenarios() {
  const { inputs, setInput } = useScenarioStore();
  const { setDataset, setAnalytics } = useKpiStore();

  const handleGenerate = () => {
    const scenario = inputs;

    const dataset = generateDataset(scenario);
    const correlations = calculateCorrelations(dataset, scenario);
    const deltas = calculateDeltas(dataset);
    const causality = calculateCausalityScores({
      dataset,
      scenario,
      correlations,
      deltas,
    });

    setDataset(dataset);
    setAnalytics({
      correlations,
      deltas,
      causality,
    });
  };

  return (
    <div>
      <h1>Scenario Inputs</h1>
      <p style={{ marginTop: 4, marginBottom: 16, color: "#4b5563" }}>
        Configure synthetic conditions and generate a KPI dataset for analysis.
      </p>

      {/* Form container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        {/* Performance block */}
        <section
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f3f4f6",
          }}
        >
          <h2>Performance & Stability</h2>
          <p style={{ marginTop: 4, marginBottom: 12, fontSize: "0.8rem", color: "#6b7280" }}>
            How fast and reliable is the experience?
          </p>

          <FieldNumber
            label="Latency Change (%)"
            helper="Positive means slower; negative means faster."
            value={inputs.latency_change}
            onChange={(v) => setInput("latency_change", v)}
          />

          <FieldNumber
            label="Crash Rate Change (%)"
            helper="Relative change in crash rate."
            value={inputs.crash_rate_change}
            onChange={(v) => setInput("crash_rate_change", v)}
          />
        </section>

        {/* Demand & Growth block */}
        <section
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f3f4f6",
          }}
        >
          <h2>Demand & Growth</h2>
          <p style={{ marginTop: 4, marginBottom: 12, fontSize: "0.8rem", color: "#6b7280" }}>
            Traffic and marketing pressure.
          </p>

          <FieldNumber
            label="Traffic Change (%)"
            helper="Overall traffic uplift or drop."
            value={inputs.traffic_change}
            onChange={(v) => setInput("traffic_change", v)}
          />

          <div style={{ marginBottom: "10px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Campaign Intensity (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={inputs.campaign_intensity}
              onChange={(e) =>
                setInput("campaign_intensity", Number(e.target.value) || 0)
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              50 = neutral, &lt;50 lower, &gt;50 higher intensity.
            </p>
          </div>
        </section>

        {/* Pricing & Feature block */}
        <section
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#f3f4f6",
          }}
        >
          <h2>Pricing & Experimentation</h2>
          <p style={{ marginTop: 4, marginBottom: 12, fontSize: "0.8rem", color: "#6b7280" }}>
            Price moves and feature flags.
          </p>

          <FieldNumber
            label="Price Change (%)"
            helper="Positive means price increase."
            value={inputs.price_change}
            onChange={(v) => setInput("price_change", v)}
          />

          <div style={{ marginBottom: "10px", marginTop: "8px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              <input
                type="checkbox"
                checked={inputs.feature_toggle}
                onChange={(e) => setInput("feature_toggle", e.target.checked)}
              />
              Feature Toggle Enabled
            </label>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              When enabled, Android segments are more impacted.
            </p>
          </div>
        </section>
      </div>

      {/* Generate button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleGenerate}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "2px solid #111827",
            backgroundColor: "#111827",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Generate Data
        </button>
      </div>
    </div>
  );
}

interface FieldNumberProps {
  label: string;
  helper?: string;
  value: number;
  onChange: (value: number) => void;
}

function FieldNumber({ label, helper, value, onChange }: FieldNumberProps) {
  // Input'ta göstereceğimiz değer:
  // Eğer value === 0 ise "" gösteriyoruz (placeholder gibi davranması için)
  const displayValue = value === 0 ? "" : String(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Sadece sayı ve negatif işaretine izin ver
    const cleaned = raw.replace(/[^0-9-]/g, "");

    // Eğer kullanıcı sadece "-" girdiyse, geçici olarak onu izin veriyoruz
    if (cleaned === "-") {
      onChange(0);
      return;
    }

    // Eğer tamamen boşsa 0 olarak sakla
    if (cleaned === "") {
      onChange(0);
      return;
    }

    // Normal sayı parse et
    const numericValue = Number(cleaned);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      >
        {label}
      </label>

      <input
        type="text"
        value={displayValue}
        placeholder="0"
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          boxSizing: "border-box",
        }}
      />

      {helper && (
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}



