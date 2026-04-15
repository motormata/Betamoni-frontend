import { CalendarCheck, Clock, CircleCheck, CircleAlert } from "lucide-react";
import type { TodayRepaymentsData } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";

// ── Component ──────────────────────────────────────────────────────

interface TodayRepaymentsCardProps {
  data?: TodayRepaymentsData | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function TodayRepaymentsCard({
  data,
  isLoading,
  isError,
}: TodayRepaymentsCardProps) {
  const collectionRate = data?.collection_rate ?? 0;

  // Color based on rate
  const rateColor =
    collectionRate >= 80
      ? "text-success"
      : collectionRate >= 50
        ? "text-warning"
        : "text-danger";

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
        <div className="h-4 w-36 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-destructive">
          Unable to load repayment data
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Today's Repayments</h3>
        </div>
        <span className={`text-xl font-bold ${rateColor}`}>
          {collectionRate}%
        </span>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox
          icon={<Clock className="h-3.5 w-3.5 text-warning" />}
          label="Pending"
          value={String(data?.pending_count ?? 0)}
        />
        <StatBox
          icon={<CircleCheck className="h-3.5 w-3.5 text-success" />}
          label="Paid"
          value={String(data?.paid_count ?? 0)}
        />
        <StatBox
          label="Expected"
          value={formatCurrency(data?.total_expected ?? 0)}
        />
        <StatBox
          icon={<CircleAlert className="h-3.5 w-3.5 text-danger" />}
          label="Outstanding"
          value={formatCurrency(data?.outstanding ?? 0)}
        />
      </div>

      {/* Collection Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Collection Progress</span>
          <span>
            {formatCurrency(data?.total_collected ?? 0)} /{" "}
            {formatCurrency(data?.total_expected ?? 0)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              collectionRate >= 80
                ? "bg-success"
                : collectionRate >= 50
                  ? "bg-warning"
                  : "bg-danger"
            }`}
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Stat Box ───────────────────────────────────────────────────────

function StatBox({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-base font-bold">{value}</p>
    </div>
  );
}
