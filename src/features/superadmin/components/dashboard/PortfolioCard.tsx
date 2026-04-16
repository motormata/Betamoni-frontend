import { BarChart2, TrendingDown, TrendingUp } from "lucide-react";
import type { PortfolioData } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";

// ── Component ──────────────────────────────────────────────────────

interface PortfolioCardProps {
  data?: PortfolioData | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function PortfolioCard({ data, isLoading, isError }: PortfolioCardProps) {
  const recoveryRate = data?.recovery_rate ?? 0;
  const totalExposure = data?.total_exposure ?? 0;
  const received = data?.breakdown?.total_received ?? 0;
  const outstanding = data?.breakdown?.total_outstanding ?? 0;
  const overdue = data?.breakdown?.overdue_outstanding ?? 0;
  const current = data?.breakdown?.current_outstanding ?? 0;

  // Deployed % bar
  const deployedPct = totalExposure > 0 ? Math.min((received / totalExposure) * 100, 100) : 0;

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-2 w-full bg-muted rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i=><div key={i} className="h-14 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-destructive">Unable to load portfolio data</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Total Active Portfolio</h3>
        </div>
        <span className="text-xs font-semibold text-success">
          {recoveryRate}% recovered
        </span>
      </div>

      {/* Total exposure */}
      <p className="text-3xl font-bold tracking-tight">
        {formatCurrency(totalExposure)}
      </p>

      {/* Recovery progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Received</span>
          <span>{formatCurrency(received)}</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all duration-700"
            style={{ width: `${deployedPct}%` }}
          />
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* <StatTile
          icon={<TrendingUp className="h-3.5 w-3.5 text-success" />}
          label="Received"
          value={formatCurrency(received)}
        /> */}
        {/* <StatTile
          label="Total Outstanding"
          value={formatCurrency(outstanding)}
        /> */}
        <StatTile
          icon={<TrendingDown className="h-3.5 w-3.5 text-danger" />}
          label="Overdue"
          value={formatCurrency(overdue)}
          valueClass="text-danger"
        />
        <StatTile
          label="Current Outstanding"
          value={formatCurrency(current)}
          valueClass="text-info"
        />
      </div>

      {/* Loan count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
        <span>Total Loans</span>
        <span className="font-semibold text-foreground">{data?.loan_count ?? 0} Loans</span>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────

function StatTile({
  icon,
  label,
  value,
  valueClass = "",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-muted/20 border p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
