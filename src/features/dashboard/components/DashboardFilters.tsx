import { useState } from "react";
import type { Market } from "@/types/dashboard.types";

// ── Time Range Options ─────────────────────────────────────────────

export type TimeRange = "day" | "week" | "month" | "year" | "custom";

const timeRangeLabels: { value: TimeRange; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

// ── Props ──────────────────────────────────────────────────────────

interface DashboardFiltersProps {
  markets: Market[];
  selectedMarketId: number | null;
  onMarketChange: (marketId: number) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  customFrom: string;
  customTo: string;
  onCustomDatesChange: (from: string, to: string) => void;
  isLoadingMarkets?: boolean;
}

// ── Component ──────────────────────────────────────────────────────

export function DashboardFilters({
  markets,
  selectedMarketId,
  onMarketChange,
  timeRange,
  onTimeRangeChange,
  customFrom,
  customTo,
  onCustomDatesChange,
  isLoadingMarkets,
}: DashboardFiltersProps) {
  const [localFrom, setLocalFrom] = useState(customFrom);
  const [localTo, setLocalTo] = useState(customTo);

  function handleApplyCustom() {
    if (localFrom && localTo) {
      onCustomDatesChange(localFrom, localTo);
    }
  }

  return (
    <div className="space-y-3">
      {/* Market Selector Row */}
      <div className="flex items-center justify-between gap-3">
        <select
          value={selectedMarketId ?? ""}
          onChange={(e) => onMarketChange(Number(e.target.value))}
          disabled={isLoadingMarkets}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 min-w-[160px] flex-1 max-w-[220px]"
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

      {/* Time Range Toggle */}
      <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
        {timeRangeLabels.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimeRangeChange(value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              timeRange === value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers — only visible when "Custom" is selected */}
      {timeRange === "custom" && (
        <div className="flex items-end gap-2 p-3 rounded-lg border bg-muted/20">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
              From
            </label>
            <input
              type="date"
              value={localFrom}
              max={localTo || undefined}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
              To
            </label>
            <input
              type="date"
              value={localTo}
              min={localFrom || undefined}
              onChange={(e) => setLocalTo(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            disabled={!localFrom || !localTo}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 whitespace-nowrap hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
