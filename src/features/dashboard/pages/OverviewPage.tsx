import { useState, useEffect, useMemo } from "react";
import {
  useGetMarketsQuery,
  useGetCashPositionQuery,
  useGetTodayRepaymentsQuery,
  useGetHistoricalQuery,
} from "@/api/endpoints/dashboardApi";
import { DashboardFilters, type TimeRange } from "../components/DashboardFilters";
import { KpiCards } from "../components/KpiCards";
import { CashPositionCard } from "../components/CashPositionCard";
import { TodayRepaymentsCard } from "../components/TodayRepaymentsCard";
import { CollectionsChart } from "../components/CollectionsChart";

// ── Date Helpers ───────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateRange(range: TimeRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date();

  switch (range) {
    case "day":
      // Just today — same from/to
      break;
    case "week":
      from.setDate(from.getDate() - 6);
      break;
    case "month":
      from.setDate(from.getDate() - 29);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      break;
    case "custom":
      // handled separately via customFrom/customTo state
      break;
  }

  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

// ── Overview Page ──────────────────────────────────────────────────

export function OverviewPage() {
  const today = todayString();

  // ── Filter State ─────────────────────────────────────────────────
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  // Custom date range — only used when timeRange === "custom"
  const [customFrom, setCustomFrom] = useState(
    // default to 7 days ago
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString().split("T")[0];
    })(),
  );
  const [customTo, setCustomTo] = useState(today);

  // ── Fetch markets for the selector ───────────────────────────────
  const { data: marketsRes, isLoading: marketsLoading } = useGetMarketsQuery();
  const markets = marketsRes?.data ?? [];

  // Auto-select first market when data loads
  useEffect(() => {
    if (markets.length > 0 && selectedMarketId === null) {
      setSelectedMarketId(markets[0].id);
    }
  }, [markets, selectedMarketId]);

  // ── Compute date range for historical query ───────────────────────
  const dateRange = useMemo(() => {
    if (timeRange === "custom") {
      return { from: customFrom, to: customTo };
    }
    return getDateRange(timeRange);
  }, [timeRange, customFrom, customTo]);

  // ── Skip queries until we have a valid market_id ─────────────────
  const skip = selectedMarketId === null;

  // ── Fetch dashboard data ─────────────────────────────────────────
  const cashPosition = useGetCashPositionQuery(
    { market_id: selectedMarketId!, date: today },
    { skip },
  );

  const todayRepayments = useGetTodayRepaymentsQuery(
    { market_id: selectedMarketId!, date: today },
    { skip },
  );

  const historical = useGetHistoricalQuery(
    {
      market_id: selectedMarketId!,
      from_date: dateRange.from,
      to_date: dateRange.to,
    },
    { skip },
  );

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-5">
      {/* Filters */}
      <DashboardFilters
        markets={markets}
        selectedMarketId={selectedMarketId}
        onMarketChange={setSelectedMarketId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        customFrom={customFrom}
        customTo={customTo}
        onCustomDatesChange={(from, to) => {
          setCustomFrom(from);
          setCustomTo(to);
        }}
        isLoadingMarkets={marketsLoading}
      />

      {/* KPI Cards (placeholder until /api/dashboard is fixed) */}
      <KpiCards />

      {/* Cash Position */}
      <CashPositionCard
        data={cashPosition.data?.data}
        isLoading={cashPosition.isLoading}
        isError={cashPosition.isError}
      />

      {/* Today Repayments */}
      <TodayRepaymentsCard
        data={todayRepayments.data?.data}
        isLoading={todayRepayments.isLoading}
        isError={todayRepayments.isError}
      />

      {/* Collections Analysis Chart — timeRange passed for aggregation logic */}
      <CollectionsChart
        data={historical.data?.data}
        isLoading={historical.isLoading}
        isError={historical.isError}
        timeRange={timeRange}
      />
    </div>
  );
}
