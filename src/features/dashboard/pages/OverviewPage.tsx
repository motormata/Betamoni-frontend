import { useState, useEffect, useMemo } from "react";
import {
  useGetMarketsQuery,
  useGetDashboardSummaryQuery,
  useGetHistoricalQuery,
} from "@/api/endpoints/dashboardApi";
import { DashboardFilters } from "../components/DashboardFilters";
import { KpiCards } from "../components/KpiCards";
import { CashPositionCard } from "../components/CashPositionCard";
import { PortfolioCard } from "../components/PortfolioCard";
import { TodayRepaymentsCard } from "../components/TodayRepaymentsCard";
import { CollectionsChart, type TimeRange } from "../components/CollectionsChart";

// ── Date Helpers ───────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateRange(range: TimeRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  switch (range) {
    case "week":    from.setDate(from.getDate() - 6); break;
    case "month":   from.setDate(from.getDate() - 29); break;
    case "year":    from.setFullYear(from.getFullYear() - 1); break;
    case "custom":
    case "day":
    default:        break;
  }
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

// ── Overview Page ──────────────────────────────────────────────────

export function OverviewPage() {
  const today = todayString();

  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState(today);

  const { data: marketsRes, isLoading: marketsLoading } = useGetMarketsQuery();
  const markets = marketsRes?.data ?? [];

  useEffect(() => {
    if (markets.length > 0 && selectedMarketId === null) {
      setSelectedMarketId(markets[0].id);
    }
  }, [markets, selectedMarketId]);

  const dateRange = useMemo(() => {
    if (timeRange === "custom") return { from: customFrom, to: customTo };
    return getDateRange(timeRange);
  }, [timeRange, customFrom, customTo]);

  const skip = selectedMarketId === null;

  const summary = useGetDashboardSummaryQuery(
    { market_id: selectedMarketId! },
    { skip },
  );
  const historical = useGetHistoricalQuery(
    { market_id: selectedMarketId!, from_date: dateRange.from, to_date: dateRange.to },
    { skip },
  );

  const d = summary.data?.data;

  // ────────────────────────────────────────────────────────────────
  // Mobile:  stacked column
  // Desktop: 2×2 grid of 4 cards, then chart full-width
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Market selector */}
      <DashboardFilters
        markets={markets}
        selectedMarketId={selectedMarketId}
        onMarketChange={setSelectedMarketId}
        isLoadingMarkets={marketsLoading}
      />

      {/* 2×2 card grid on lg, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Active Loans (2×2 internal grid) */}
        <KpiCards data={d?.active_loans} isLoading={summary.isLoading} />

        {/* Card 2: Cash on Hand + Cash Recovered (merged) */}
        <CashPositionCard
          data={d?.cash_position}
          collectionsData={d?.today?.collections}
          isLoading={summary.isLoading}
          isError={summary.isError}
        />

        {/* Card 3: Portfolio */}
        <PortfolioCard
          data={d?.portfolio}
          isLoading={summary.isLoading}
          isError={summary.isError}
        />

        {/* Card 4: Today's Repayments */}
        <TodayRepaymentsCard
          data={d?.today?.expected_repayments}
          isLoading={summary.isLoading}
          isError={summary.isError}
        />
      </div>

      {/* Historical chart (full width, filter built-in) */}
      <CollectionsChart
        data={historical.data?.data}
        isLoading={historical.isLoading}
        isError={historical.isError}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        customFrom={customFrom}
        customTo={customTo}
        onCustomDatesChange={(from, to) => {
          setCustomFrom(from);
          setCustomTo(to);
        }}
      />
    </div>
  );
}
