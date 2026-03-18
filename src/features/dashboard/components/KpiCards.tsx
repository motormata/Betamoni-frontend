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
  const daily = data?.by_type?.daily ?? { count: 0, total_principal: 0 };
  const weekly = data?.by_type?.weekly ?? { count: 0, total_principal: 0 };
  const monthly = data?.by_type?.monthly ?? { count: 0, total_principal: 0 };

  const cards = [
    { label: "Total Active", count: total, sub: "", color: "text-foreground" },
    { label: "Daily", count: daily.count, sub: formatCurrency(daily.total_principal), color: "text-sky-500" },
    { label: "Weekly", count: weekly.count, sub: formatCurrency(weekly.total_principal), color: "text-violet-500" },
    { label: "Monthly", count: monthly.count, sub: formatCurrency(monthly.total_principal), color: "text-amber-500" },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 h-full animate-pulse">
        <div className="h-4 w-28 bg-muted rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-muted/40 p-3 h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 h-full">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        Active Loans
      </p>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-muted/20 p-3 space-y-0.5"
          >
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`text-xl font-bold ${card.color}`}>{card.count}</p>
            {card.sub && (
              <p className="text-[11px] text-muted-foreground truncate">{card.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
