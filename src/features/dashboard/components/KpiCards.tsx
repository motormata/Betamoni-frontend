import type { ActiveLoansData } from "@/types/dashboard.types";
import { formatCurrency } from "./CashPositionCard";

// ── Props ──────────────────────────────────────────────────────────

interface KpiCardsProps {
  data?: ActiveLoansData | null;
  isLoading?: boolean;
}

// ── Component ──────────────────────────────────────────────────────

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  const total = data?.total_active_loans ?? 0;
  const daily = data?.by_type?.daily.count ?? 0;
  const weekly = data?.by_type?.weekly.count ?? 0;
  const monthly = data?.by_type?.monthly.count ?? 0;

  const dailyPrincipal = data?.by_type?.daily.total_principal ?? 0;
  const weeklyPrincipal = data?.by_type?.weekly.total_principal ?? 0;
  const monthlyPrincipal = data?.by_type?.monthly.total_principal ?? 0;

  const cards = [
    {
      label: "Daily Loans",
      count: daily,
      sub: formatCurrency(dailyPrincipal),
      color: "text-sky-500",
    },
    {
      label: "Weekly Loans",
      count: weekly,
      sub: formatCurrency(weeklyPrincipal),
      color: "text-violet-500",
    },
    {
      label: "Monthly Loans",
      count: monthly,
      sub: formatCurrency(monthlyPrincipal),
      color: "text-amber-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-2 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-6 w-10 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-sm text-muted-foreground">Total Active Loans</span>
      </div>

      {/* Per-type breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-4 space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`text-xl font-bold ${card.color}`}>{card.count}</p>
            <p className="text-[11px] text-muted-foreground truncate">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
