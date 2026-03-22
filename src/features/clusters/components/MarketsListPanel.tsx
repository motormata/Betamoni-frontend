import { Store, MapPin } from "lucide-react";
import { useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";
import { LoadingState, ErrorState, EmptyState } from "@/features/agent/components/FeedbackStates";

// ── Markets List Panel ─────────────────────────────────────────────

export function MarketsListPanel() {
  const { data, isLoading, isError } = useGetClusterMarketsQuery();
  const markets = data?.data ?? [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Failed to load markets" />;
  if (markets.length === 0) return <EmptyState message="No markets yet. Create one above." />;

  return (
    <ul className="divide-y divide-border">
      {markets.map((market) => (
        <li
          key={market.id}
          className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
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
  );
}
