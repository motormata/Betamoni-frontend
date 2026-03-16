import { BarChart3 } from "lucide-react";
import type { HistoricalData, HistoricalDayEntry } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";
import type { TimeRange } from "./DashboardFilters";

// ── Aggregation Helpers ────────────────────────────────────────────

interface ChartBar {
  label: string;
  expected: number;
  collected: number;
}

/** Group daily_breakdown into bars depending on the active TimeRange */
function aggregateData(
  breakdown: HistoricalDayEntry[],
  timeRange: TimeRange,
): ChartBar[] {
  if (breakdown.length === 0) return [];

  // Day view → one bar per day, label = "Mon", "Tue", etc.
  if (timeRange === "day" || timeRange === "week" || timeRange === "custom") {
    return breakdown.map((d) => ({
      label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).replace(",", ""),
      expected: d.repayments.total_expected,
      collected: d.collections.total_recovered,
    }));
  }

  // Month view → group into ISO weeks (4–5 bars)
  if (timeRange === "month") {
    const weekMap = new Map<string, ChartBar>();
    breakdown.forEach((d) => {
      const date = new Date(d.date + "T00:00:00");
      // Compute ISO week number within the data range
      const weekOf = getWeekStart(date);
      const key = weekOf;
      const label = `Wk ${new Date(weekOf + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
      if (!weekMap.has(key)) {
        weekMap.set(key, { label, expected: 0, collected: 0 });
      }
      const entry = weekMap.get(key)!;
      entry.expected += d.repayments.total_expected;
      entry.collected += d.collections.total_recovered;
    });
    return Array.from(weekMap.values());
  }

  // Year view → group by calendar month (12 bars)
  if (timeRange === "year") {
    const monthMap = new Map<string, ChartBar>();
    breakdown.forEach((d) => {
      const date = new Date(d.date + "T00:00:00");
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (!monthMap.has(key)) {
        monthMap.set(key, { label, expected: 0, collected: 0 });
      }
      const entry = monthMap.get(key)!;
      entry.expected += d.repayments.total_expected;
      entry.collected += d.collections.total_recovered;
    });
    return Array.from(monthMap.values());
  }

  return breakdown.map((d) => ({
    label: d.date,
    expected: d.repayments.total_expected,
    collected: d.collections.total_recovered,
  }));
}

/** Returns the Monday of the week containing `date` as YYYY-MM-DD */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // Adjust so Monday is start
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

// ── Component ──────────────────────────────────────────────────────

interface CollectionsChartProps {
  data?: HistoricalData | null;
  isLoading?: boolean;
  isError?: boolean;
  timeRange?: TimeRange;
}

export function CollectionsChart({
  data,
  isLoading,
  isError,
  timeRange = "week",
}: CollectionsChartProps) {
  const breakdown = data?.daily_breakdown ?? [];
  const summary = data?.summary;
  const collectionRate = summary?.collection_rate ?? 0;

  const bars = aggregateData(breakdown, timeRange);

  // Find max value for scaling the bars
  const maxValue = Math.max(
    ...bars.map((b) => Math.max(b.expected, b.collected, 1)),
    1,
  );

  // Min bar width so there's always enough space to scroll through
  const BAR_MIN_WIDTH = 52; // px each bar group
  const chartMinWidth = Math.max(bars.length * BAR_MIN_WIDTH, 280);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
        <div className="h-4 w-48 bg-muted rounded" />
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Collections Analysis</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Expected vs Collected (NGN)
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-500">
            {collectionRate}%
          </span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Rate
          </p>
        </div>
      </div>

      {/* Scrollable Bar Chart */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div
          className="flex items-end gap-2 h-44"
          style={{ minWidth: chartMinWidth }}
        >
          {bars.map((bar, idx) => {
            const expectedH = (bar.expected / maxValue) * 100;
            const collectedH = (bar.collected / maxValue) * 100;

            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1"
                style={{ minWidth: BAR_MIN_WIDTH, flex: "1 0 auto" }}
              >
                {/* Bar pair */}
                <div className="flex gap-[3px] items-end w-full h-[130px]">
                  {/* Expected */}
                  <div
                    className="flex-1 rounded-t bg-slate-200 dark:bg-slate-700 transition-all duration-500"
                    style={{ height: `${Math.max(expectedH, 3)}%` }}
                    title={`Expected: ${formatCurrency(bar.expected)}`}
                  />
                  {/* Collected */}
                  <div
                    className="flex-1 rounded-t bg-emerald-500 transition-all duration-500"
                    style={{ height: `${Math.max(collectedH, 3)}%` }}
                    title={`Collected: ${formatCurrency(bar.collected)}`}
                  />
                </div>
                {/* X-axis label */}
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
          <span className="font-semibold text-foreground ml-1">
            {formatCurrency(summary?.total_expected ?? 0)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Collected</span>
          <span className="font-semibold text-foreground ml-1">
            {formatCurrency(summary?.total_collected ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
