import { useState } from "react";
import { BarChart3 } from "lucide-react";
import type { HistoricalData, HistoricalDayEntry } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";

// ── Time Range ─────────────────────────────────────────────────────

export type TimeRange = "day" | "week" | "month" | "year" | "custom";

const timeRangeLabels: { value: TimeRange; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

// ── Aggregation Helpers ────────────────────────────────────────────

interface ChartBar {
  label: string;
  expected: number;
  collected: number;
}

function aggregateData(breakdown: HistoricalDayEntry[], timeRange: TimeRange): ChartBar[] {
  if (breakdown.length === 0) return [];

  if (timeRange === "day" || timeRange === "week" || timeRange === "custom") {
    return breakdown.map((d) => ({
      label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).replace(",", ""),
      expected: Number(d.total_expected) || 0,
      collected: Number(d.total_collections) || 0,
    }));
  }

  if (timeRange === "month") {
    const weekMap = new Map<string, ChartBar>();
    breakdown.forEach((d) => {
      const date = new Date(d.date + "T00:00:00");
      const weekOf = getWeekStart(date);
      const label = `Wk ${new Date(weekOf + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      if (!weekMap.has(weekOf)) weekMap.set(weekOf, { label, expected: 0, collected: 0 });
      const entry = weekMap.get(weekOf)!;
      entry.expected += Number(d.total_expected) || 0;
      entry.collected += Number(d.total_collections) || 0;
    });
    return Array.from(weekMap.values());
  }

  if (timeRange === "year") {
    const monthMap = new Map<string, ChartBar>();
    breakdown.forEach((d) => {
      const date = new Date(d.date + "T00:00:00");
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!monthMap.has(key)) monthMap.set(key, { label, expected: 0, collected: 0 });
      const entry = monthMap.get(key)!;
      entry.expected += Number(d.total_expected) || 0;
      entry.collected += Number(d.total_collections) || 0;
    });
    return Array.from(monthMap.values());
  }

  return breakdown.map((d) => ({
    label: d.date,
    expected: Number(d.total_expected) || 0,
    collected: Number(d.total_collections) || 0,
  }));
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

// ── Component ──────────────────────────────────────────────────────

interface CollectionsChartProps {
  data?: HistoricalData | null;
  isLoading?: boolean;
  isError?: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  customFrom: string;
  customTo: string;
  onCustomDatesChange: (from: string, to: string) => void;
}

export function CollectionsChart({
  data,
  isLoading,
  isError,
  timeRange,
  onTimeRangeChange,
  customFrom,
  customTo,
  onCustomDatesChange,
}: CollectionsChartProps) {
  const breakdown = data?.daily_breakdown ?? [];
  const summary = data?.summary;
  const collectionRate = summary?.collection_rate ?? 0;
  const bars = aggregateData(breakdown, timeRange);
  const maxValue = Math.max(...bars.map((b) => Math.max(b.expected, b.collected, 1)), 1);
  const BAR_MIN_WIDTH = 52;
  const chartMinWidth = Math.max(bars.length * BAR_MIN_WIDTH, 280);

  const [localFrom, setLocalFrom] = useState(customFrom);
  const [localTo, setLocalTo] = useState(customTo);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
        <div className="h-4 w-48 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
        <div className="flex items-end gap-3 h-40 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex gap-1 items-end" style={{ minWidth: BAR_MIN_WIDTH }}>
              <div className="flex-1 bg-muted rounded-t" style={{ height: `${40 + (i * 17) % 60}%` }} />
              <div className="flex-1 bg-muted/60 rounded-t" style={{ height: `${25 + (i * 11) % 50}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-destructive">Unable to load historical data</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Header + Rate */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Collections Analysis</h3>
          </div>
          <p className="text-xs text-muted-foreground">Expected vs Collected (NGN)</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-500">{collectionRate}%</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rate</p>
        </div>
      </div>

      {/* Time Range Toggle — now part of the chart */}
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

      {/* Custom date pickers */}
      {timeRange === "custom" && (
        <div className="flex items-end gap-2 p-3 rounded-lg border bg-muted/20">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">From</label>
            <input
              type="date"
              value={localFrom}
              max={localTo || undefined}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">To</label>
            <input
              type="date"
              value={localTo}
              min={localFrom || undefined}
              onChange={(e) => setLocalTo(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button
            onClick={() => { if (localFrom && localTo) onCustomDatesChange(localFrom, localTo); }}
            disabled={!localFrom || !localTo}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 whitespace-nowrap hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Scrollable Bar Chart */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex items-end gap-2 h-44" style={{ minWidth: chartMinWidth }}>
          {bars.map((bar, idx) => {
            const expectedH = (bar.expected / maxValue) * 100;
            const collectedH = (bar.collected / maxValue) * 100;
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1"
                style={{ minWidth: BAR_MIN_WIDTH, flex: "1 0 auto" }}
              >
                <div className="flex gap-[3px] items-end w-full h-[130px]">
                  <div
                    className="flex-1 rounded-t bg-slate-200 dark:bg-slate-700 transition-all duration-500"
                    style={{ height: `${Math.max(expectedH, 3)}%` }}
                    title={`Expected: ${formatCurrency(bar.expected)}`}
                  />
                  <div
                    className="flex-1 rounded-t bg-emerald-500 transition-all duration-500"
                    style={{ height: `${Math.max(collectedH, 3)}%` }}
                    title={`Collected: ${formatCurrency(bar.collected)}`}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2 max-w-full">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground pt-1 border-t">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
          <span>Expected</span>
          <span className="font-semibold text-foreground ml-1">{formatCurrency(summary?.total_expected ?? 0)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Collected</span>
          <span className="font-semibold text-foreground ml-1">{formatCurrency(summary?.total_collected ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
