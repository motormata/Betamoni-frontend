import { Banknote } from "lucide-react";
import type { DailyCollectionsData } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";

// ── Component ──────────────────────────────────────────────────────

interface DailyCollectionsCardProps {
  data?: DailyCollectionsData | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function DailyCollectionsCard({
  data,
  isLoading,
  isError,
}: DailyCollectionsCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse h-full">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-8 w-36 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-5 h-full">
        <p className="text-sm text-destructive">Unable to load collections data</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Cash Recovered</h3>
        </div>
        <span className="text-xs text-muted-foreground">{data?.date}</span>
      </div>

      {/* Key figure */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">
          {formatCurrency(data?.total_recovered ?? 0)}
        </span>
        <span className="text-sm text-muted-foreground">
          {data?.payment_count ?? 0} payments
        </span>
      </div>

      {/* Per-type breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {(["daily", "weekly", "monthly"] as const).map((type) => {
          const entry = data?.by_loan_type[type];
          return (
            <div
              key={type}
              className="rounded-lg bg-muted/20 border p-2.5 space-y-0.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground capitalize">
                {type}
              </p>
              <p className="text-sm font-bold">
                {formatCurrency(entry?.total_amount ?? 0)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {entry?.count ?? 0} txns
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
