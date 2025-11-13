import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TimeSeriesPoint } from "../types/domain";

interface TrendChartProps {
  data: TimeSeriesPoint[];
  kpi: string;
}

export function TrendChart({ data, kpi }: TrendChartProps) {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 16, right: 16, top: 10, bottom: 10 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0070f3"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
