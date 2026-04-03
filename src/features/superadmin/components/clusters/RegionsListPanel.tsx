import { MapPin, Hash } from "lucide-react";
import { useGetRegionsQuery } from "@/api/endpoints/clustersApi";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";

// ── Regions List Panel ─────────────────────────────────────────────

export function RegionsListPanel() {
  const { data, isLoading, isError } = useGetRegionsQuery();
  const regions = data?.data ?? [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Failed to load regions" />;
  if (regions.length === 0) return <EmptyState message="No regions yet. Create one above." />;

  return (
    <ul className="divide-y divide-border">
      {regions.map((region) => (
        <li
          key={region.id}
          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium truncate">{region.name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-mono font-semibold text-muted-foreground">
              {region.code}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
