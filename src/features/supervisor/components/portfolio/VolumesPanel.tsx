import { MetricTile, type MetricItem } from "./MetricTile";

interface VolumesPanelProps {
  metrics: MetricItem[];
}

export function VolumesPanel({ metrics }: VolumesPanelProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <MetricTile key={metric.label} metric={metric} variant="spacious" />
      ))}
    </div>
  );
}
