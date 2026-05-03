import { MetricTile, type MetricItem } from "./MetricTile";

interface CountsPanelProps {
  metrics: MetricItem[];
}

export function CountsPanel({ metrics }: CountsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricTile key={metric.label} metric={metric} variant="compact" />
      ))}
    </div>
  );
}
