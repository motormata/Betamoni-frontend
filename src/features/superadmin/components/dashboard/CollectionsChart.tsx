import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import type { HistoricalData, HistoricalDayEntry } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";

export type TimeRange = "day" | "week" | "month" | "year" | "custom";
type ChartMode = "collections" | "volumes" | "counts";

const timeRangeLabels: { value: TimeRange; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

const chartModes: { value: ChartMode; label: string }[] = [
  { value: "collections", label: "Collections" },
  { value: "volumes", label: "Loan Volumes" },
  { value: "counts", label: "Loan Counts" },
];

interface ChartBar {
  key: string;
  label: string;
  expected: number;
  collected: number;
  approvedCount: number;
  approvedVolume: number;
  disbursedCount: number;
  disbursedVolume: number;
  rejectedCount: number;
  rejectedVolume: number;
}

interface ChartSeries {
  key: string;
  label: string;
  colorClass: string;
  dotClass: string;
  value: (bar: ChartBar) => number;
  total: number;
  formatter: (value: number) => string;
}

interface CollectionsChartProps {
  data?: HistoricalData | null;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  customFrom: string;
  customTo: string;
  onCustomDatesChange: (from: string, to: string) => void;
}

function createEmptyBar(key: string, label: string): ChartBar {
  return {
    key,
    label,
    expected: 0,
    collected: 0,
    approvedCount: 0,
    approvedVolume: 0,
    disbursedCount: 0,
    disbursedVolume: 0,
    rejectedCount: 0,
    rejectedVolume: 0,
  };
}

function addDayToBar(target: ChartBar, day: HistoricalDayEntry) {
  target.expected += Number(day.total_expected) || 0;
  target.collected += Number(day.total_collections) || 0;
  target.approvedCount += Number(day.total_approved_count) || 0;
  target.approvedVolume += Number(day.total_approved_volume) || 0;
  target.disbursedCount += Number(day.total_disbursed_count) || 0;
  target.disbursedVolume += Number(day.total_disbursed_volume) || 0;
  target.rejectedCount += Number(day.total_rejected_count) || 0;
  target.rejectedVolume += Number(day.total_rejected_volume) || 0;
}

function formatDayLabel(dateString: string): string {
  return new Date(`${dateString}T00:00:00`)
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .replace(",", "");
}

function getWeekStart(date: Date): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy.toISOString().split("T")[0];
}

function aggregateData(breakdown: HistoricalDayEntry[], timeRange: TimeRange): ChartBar[] {
  if (breakdown.length === 0) return [];

  if (timeRange === "day" || timeRange === "week" || timeRange === "custom") {
    return breakdown.map((day) => {
      const bar = createEmptyBar(day.date, formatDayLabel(day.date));
      addDayToBar(bar, day);
      return bar;
    });
  }

  if (timeRange === "month") {
    const weekMap = new Map<string, ChartBar>();

    breakdown.forEach((day) => {
      const date = new Date(`${day.date}T00:00:00`);
      const weekKey = getWeekStart(date);
      const label = `Wk ${new Date(`${weekKey}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, createEmptyBar(weekKey, label));
      }

      addDayToBar(weekMap.get(weekKey)!, day);
    });

    return Array.from(weekMap.values());
  }

  if (timeRange === "year") {
    const monthMap = new Map<string, ChartBar>();

    breakdown.forEach((day) => {
      const date = new Date(`${day.date}T00:00:00`);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      if (!monthMap.has(key)) {
        monthMap.set(key, createEmptyBar(key, label));
      }

      addDayToBar(monthMap.get(key)!, day);
    });

    return Array.from(monthMap.values());
  }

  return [];
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

function getModeDescription(mode: ChartMode): string {
  if (mode === "collections") return "Expected vs collected cash across the selected period";
  if (mode === "volumes") return "Approved, disbursed, and rejected loan principal volumes";
  return "Approved, disbursed, and rejected loan counts";
}

function getSeries(mode: ChartMode, summary?: HistoricalData["summary"]): ChartSeries[] {
  const loans = summary?.loans;

  if (mode === "collections") {
    return [
      {
        key: "expected",
        label: "Expected",
        colorClass: "bg-muted-foreground/30",
        dotClass: "bg-muted-foreground/50",
        value: (bar) => bar.expected,
        total: Number(summary?.total_expected) || 0,
        formatter: formatCurrency,
      },
      {
        key: "collected",
        label: "Collected",
        colorClass: "bg-success",
        dotClass: "bg-success",
        value: (bar) => bar.collected,
        total: Number(summary?.total_collected) || 0,
        formatter: formatCurrency,
      },
    ];
  }

  if (mode === "volumes") {
    return [
      {
        key: "approvedVolume",
        label: "Approved Volume",
        colorClass: "bg-info",
        dotClass: "bg-info",
        value: (bar) => bar.approvedVolume,
        total: Number(loans?.approved_volume) || 0,
        formatter: formatCurrency,
      },
      {
        key: "disbursedVolume",
        label: "Disbursed Volume",
        colorClass: "bg-primary",
        dotClass: "bg-primary",
        value: (bar) => bar.disbursedVolume,
        total: Number(loans?.disbursed_volume) || 0,
        formatter: formatCurrency,
      },
      {
        key: "rejectedVolume",
        label: "Rejected Volume",
        colorClass: "bg-danger",
        dotClass: "bg-danger",
        value: (bar) => bar.rejectedVolume,
        total: Number(loans?.rejected_volume) || 0,
        formatter: formatCurrency,
      },
    ];
  }

  return [
    {
      key: "approvedCount",
      label: "Approved Count",
      colorClass: "bg-info",
      dotClass: "bg-info",
      value: (bar) => bar.approvedCount,
      total: Number(loans?.approved_count) || 0,
      formatter: formatCount,
    },
    {
      key: "disbursedCount",
      label: "Disbursed Count",
      colorClass: "bg-primary",
      dotClass: "bg-primary",
      value: (bar) => bar.disbursedCount,
      total: Number(loans?.disbursed_count) || 0,
      formatter: formatCount,
    },
    {
      key: "rejectedCount",
      label: "Rejected Count",
      colorClass: "bg-danger",
      dotClass: "bg-danger",
      value: (bar) => bar.rejectedCount,
      total: Number(loans?.rejected_count) || 0,
      formatter: formatCount,
    },
  ];
}

export function CollectionsChart({
  data,
  isLoading,
  isFetching,
  isError,
  timeRange,
  onTimeRangeChange,
  customFrom,
  customTo,
  onCustomDatesChange,
}: CollectionsChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("collections");
  const [localFrom, setLocalFrom] = useState(customFrom);
  const [localTo, setLocalTo] = useState(customTo);

  useEffect(() => {
    setLocalFrom(customFrom);
    setLocalTo(customTo);
  }, [customFrom, customTo]);

  const breakdown = data?.daily_breakdown ?? [];
  const summary = data?.summary;
  const collectionRate = summary?.collection_rate ?? 0;

  const bars = useMemo(() => aggregateData(breakdown, timeRange), [breakdown, timeRange]);
  const series = useMemo(() => getSeries(chartMode, summary), [chartMode, summary]);
  const maxValue = useMemo(() => {
    const values = bars.flatMap((bar) => series.map((item) => item.value(bar)));
    return Math.max(1, ...values);
  }, [bars, series]);
  const chartKey = `${chartMode}-${timeRange}-${data?.period.from ?? "none"}-${data?.period.to ?? "none"}`;
  const barMinWidth = chartMode === "collections" ? 58 : 74;
  const chartMinWidth = Math.max(bars.length * barMinWidth, 320);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
        <div className="flex h-44 items-end gap-3 overflow-hidden">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="flex min-w-[58px] flex-1 items-end gap-1">
              <div className="flex-1 rounded-t bg-muted" style={{ height: `${48 + (index * 9) % 38}%` }} />
              <div className="flex-1 rounded-t bg-muted/60" style={{ height: `${30 + (index * 13) % 42}%` }} />
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
    <div className="relative rounded-xl border bg-card p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Collections Analysis</h3>
          </div>
          <p className="text-xs text-muted-foreground">{getModeDescription(chartMode)}</p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-lg font-bold text-success">{collectionRate}%</span>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Collection rate
          </p>
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
          {chartModes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setChartMode(value)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                chartMode === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
          {timeRangeLabels.map(({ value, label }) => (
            <button
              key={value}
              type="button"
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
      </div>

      {timeRange === "custom" && (
        <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              From
            </label>
            <input
              type="date"
              value={localFrom}
              max={localTo || undefined}
              onChange={(event) => setLocalFrom(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              To
            </label>
            <input
              type="date"
              value={localTo}
              min={localFrom || undefined}
              onChange={(event) => setLocalTo(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (localFrom && localTo) onCustomDatesChange(localFrom, localTo);
            }}
            disabled={!localFrom || !localTo}
            className="h-9 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border bg-background/30">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              Updating chart...
            </span>
          </div>
        )}

        {bars.length === 0 ? (
          <div className="flex h-56 items-center justify-center px-4 text-center text-sm text-muted-foreground">
            No chart data is available for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto px-3 pb-3 pt-4">
            <div key={chartKey} className="flex items-end gap-3" style={{ minWidth: chartMinWidth }}>
              {bars.map((bar) => (
                <div
                  key={bar.key}
                  className="flex flex-col items-center gap-2"
                  style={{ minWidth: barMinWidth, flex: "1 0 auto" }}
                >
                  <div className="flex h-[180px] w-full items-end gap-1">
                    {series.map((item) => {
                      const value = item.value(bar);
                      const height = value > 0 ? Math.max((value / maxValue) * 100, 5) : 0;

                      return (
                        <div
                          key={`${bar.key}-${item.key}`}
                          className={`flex-1 rounded-t ${item.colorClass} transition-[height,opacity] duration-300 ease-out`}
                          style={{ height: `${height}%` }}
                          title={`${item.label}: ${item.formatter(value)}`}
                        />
                      );
                    })}
                  </div>
                  <span className="max-w-full text-center text-[10px] leading-tight text-muted-foreground">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClass}`} />
            <span>{item.label}</span>
            <span className="font-semibold text-foreground">{item.formatter(item.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
