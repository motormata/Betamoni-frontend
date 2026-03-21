import type { Market } from "@/types/dashboard.types";

// ── Props ──────────────────────────────────────────────────────────

interface DashboardFiltersProps {
  markets: Market[];
  selectedMarketId: string | null;
  onMarketChange: (marketId: string) => void;
  isLoadingMarkets?: boolean;
}

// ── Component ──────────────────────────────────────────────────────

export function DashboardFilters({
  markets,
  selectedMarketId,
  onMarketChange,
  isLoadingMarkets,
}: DashboardFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <select
        value={selectedMarketId ?? ""}
        onChange={(e) => onMarketChange(e.target.value)}
        disabled={isLoadingMarkets}
        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 min-w-[160px] max-w-[260px]"
      >
        {isLoadingMarkets && <option value="">Loading markets...</option>}
        {!isLoadingMarkets && markets.length === 0 && (
          <option value="">No markets</option>
        )}
        {markets.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <span className="text-xs text-emerald-500 font-medium whitespace-nowrap">
        Updated just now
      </span>
    </div>
  );
}
