import { useScenarioStore } from "../state/useScenarioStore";
import { useKpiStore } from "../state/useKpiStore";
import { generateDataset } from "../utils/generateDataset";
import { calculateCorrelations } from "../utils/calculateCorrelation";
import { calculateDeltas } from "../utils/calculateDelta";
import { calculateCausalityScores } from "../utils/causalityModel";




export function Scenarios() {
  const { inputs, setInput, reset } = useScenarioStore();
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

      <div>
        <label>
          Latency Change (%):
          <input
            type="number"
            value={inputs.latency_change}
            onChange={(e) =>
              setInput("latency_change", Number(e.target.value))
            }
          />
        </label>
      </div>

      <div>
        <label>
          Crash Rate Change (%):
          <input
            type="number"
            value={inputs.crash_rate_change}
            onChange={(e) =>
              setInput("crash_rate_change", Number(e.target.value))
            }
          />
        </label>
      </div>

      <div>
  <label>
    Traffic Change (%):
    <input
      type="number"
      value={inputs.traffic_change}
      onChange={(e) =>
        setInput("traffic_change", Number(e.target.value))
      }
    />
  </label>
</div>

<div>
  <label>
    Price Change (%):
    <input
      type="number"
      value={inputs.price_change}
      onChange={(e) =>
        setInput("price_change", Number(e.target.value))
      }
    />
  </label>
</div>

<div>
  <label>
    Campaign Intensity (0–100):
    <input
      type="number"
      value={inputs.campaign_intensity}
      onChange={(e) =>
        setInput("campaign_intensity", Number(e.target.value))
      }
    />
  </label>
</div>

<div>
  <label>
    Feature Toggle:
    <input
      type="checkbox"
      checked={inputs.feature_toggle}
      onChange={(e) =>
        setInput("feature_toggle", e.target.checked)
      }
    />
  </label>
</div>





      <div>
        <button onClick={reset}>Reset Scenario</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleGenerate}
          style={{ padding: "8px 12px", border: "2px solid black" }}
        >
          Generate Data
        </button>
      </div>

      <pre style={{ marginTop: "20px" }}>
        {JSON.stringify(inputs, null, 2)}
      </pre>
    </div>
  );
}
