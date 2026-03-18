import { MapPin, Loader2, AlertCircle, Hash } from "lucide-react";
import { useGetRegionsQuery } from "@/api/endpoints/clustersApi";

// ── Regions List Panel ─────────────────────────────────────────────

export function RegionsListPanel() {
  const { data, isLoading, isError } = useGetRegionsQuery();
  const regions = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Summary count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{isLoading ? "—" : regions.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Regions</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading regions…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-8 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Failed to load regions.</p>
        </div>
      ) : regions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <MapPin className="h-8 w-8 opacity-30" />
          <p className="text-sm">No regions yet. Create one →</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {regions.map((region) => (
            <li
              key={region.id}
              className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{region.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {region.id.slice(0, 8)}…</p>
                </div>
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
      )}
    </div>
  );
}
