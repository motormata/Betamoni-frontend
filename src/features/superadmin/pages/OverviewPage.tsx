import { useState, useMemo } from "react";
import {
  useGetMarketsQuery,
  useGetDashboardSummaryQuery,
  useGetHistoricalQuery,
} from "@/api/endpoints/dashboardApi";
import { DashboardFilters } from "../components/dashboard/DashboardFilters";
import { KpiCards } from "../components/dashboard/KpiCards";
import { CashPositionCard } from "../components/dashboard/CashPositionCard";
import { PortfolioCard } from "../components/dashboard/PortfolioCard";
import { TodayRepaymentsCard } from "../components/dashboard/TodayRepaymentsCard";
import { CollectionsChart, type TimeRange } from "../components/dashboard/CollectionsChart";

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

  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState(today);

  const { data: marketsRes, isLoading: marketsLoading } = useGetMarketsQuery();
  const markets = marketsRes?.data ?? [];

  const dateRange = useMemo(() => {
    if (timeRange === "custom") return { from: customFrom, to: customTo };
    return getDateRange(timeRange);
  }, [timeRange, customFrom, customTo]);

  const summary = useGetDashboardSummaryQuery(
    selectedMarketId ? { market_id: selectedMarketId } : {},
  );
  const historical = useGetHistoricalQuery({
    ...(selectedMarketId ? { market_id: selectedMarketId } : {}),
    from_date: dateRange.from,
    to_date: dateRange.to,
  });

  const d = summary.data?.data;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <DashboardFilters
        markets={markets}
        selectedMarketId={selectedMarketId}
        onMarketChange={setSelectedMarketId}
        isLoadingMarkets={marketsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KpiCards data={d?.active_loans} isLoading={summary.isLoading} />

        <CashPositionCard
          data={d?.cash_position}
          collectionsData={d?.today?.collections}
          isLoading={summary.isLoading}
          isError={summary.isError}
        />

        <PortfolioCard
          data={d?.portfolio}
          isLoading={summary.isLoading}
          isError={summary.isError}
        />

        <TodayRepaymentsCard
          data={d?.today?.expected_repayments}
          isLoading={summary.isLoading}
          isError={summary.isError}
        />
      </div>

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
