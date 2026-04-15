import { Trash2 } from "lucide-react";
import type { Market } from "@/types/dashboard.types";

// ── Props ──────────────────────────────────────────────────────────

interface DashboardFiltersProps {
  markets: Market[];
  selectedMarketId: string | null;
  onMarketChange: (marketId: string | null) => void;
  isLoadingMarkets?: boolean;
}

// ── Component ──────────────────────────────────────────────────────

export function DashboardFilters({
  markets,
  selectedMarketId,
  onMarketChange,
  isLoadingMarkets,
}: DashboardFiltersProps) {
  const isFiltered = selectedMarketId !== null;

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Select + clear button side by side */}
      <div className="flex items-center gap-2">
        <select
          value={selectedMarketId ?? ""}
          onChange={(e) => onMarketChange(e.target.value || null)}
          disabled={isLoadingMarkets}
          aria-label="Filter by market"
          className={`
            h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
            disabled:cursor-not-allowed disabled:opacity-50
            min-w-[160px] max-w-[260px] transition-colors
            ${isFiltered ? "border-primary/60 text-foreground" : "border-input text-muted-foreground"}
          `}
        >
          <option value="">
            {isLoadingMarkets ? "Loading markets…" : "All Markets"}
          </option>
          {markets.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Red bin icon — only visible when a market is actively filtered */}
        {isFiltered && !isLoadingMarkets && (
          <button
            type="button"
            onClick={() => onMarketChange(null)}
            aria-label="Clear market filter"
            className="h-9 w-9 flex items-center justify-center rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <span className="whitespace-nowrap text-xs font-medium text-info">
        Updated just now
      </span>
    </div>
  );
}
