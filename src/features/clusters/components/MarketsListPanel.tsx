import { Store, Loader2, AlertCircle, MapPin } from "lucide-react";
import { useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";

// ── Markets List Panel ─────────────────────────────────────────────

export function MarketsListPanel() {
  const { data, isLoading, isError } = useGetClusterMarketsQuery();
  const markets = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Summary count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{isLoading ? "—" : markets.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Markets</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Store className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading markets…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-8 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Failed to load markets.</p>
        </div>
      ) : markets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <Store className="h-8 w-8 opacity-30" />
          <p className="text-sm">No markets yet. Create one →</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {markets.map((market) => (
            <li
              key={market.id}
              className="flex items-start justify-between rounded-lg border bg-muted/40 px-4 py-3 hover:bg-muted/70 transition-colors gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{market.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">
                      {market.region?.name ?? "—"}
                    </p>
                  </div>
                  {market.address && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {market.address}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground shrink-0 mt-0.5">
                {market.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
