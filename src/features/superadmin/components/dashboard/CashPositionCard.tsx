import { Wallet, Banknote } from "lucide-react";
import type { CashPositionData, DailyCollectionsData } from "@/types/dashboard.types";

// ── Helpers ────────────────────────────────────────────────────────

function formatCurrency(amount: number | string, currency: string = "NGN"): string {
  const num = Number(amount);
  if (currency === "NGN") {
    return `₦${num.toLocaleString("en-NG")}`;
  }
  return num.toLocaleString("en-US", { style: "currency", currency });
}

// ── Component ──────────────────────────────────────────────────────

interface CashPositionCardProps {
  data?: CashPositionData | null;
  collectionsData?: DailyCollectionsData | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function CashPositionCard({
  data,
  collectionsData,
  isLoading,
  isError,
}: CashPositionCardProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground shadow-lg">
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/8" />
      <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/8" />

      {/* ── Cash on Hand Section ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
          Cash on Hand
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12">
          <Wallet className="h-4.5 w-4.5 text-white" />
        </div>
      </div>

      {isLoading ? (
        <div className="h-9 w-48 rounded bg-white/10 animate-pulse" />
      ) : isError ? (
        <p className="text-lg text-white/70">Unable to load</p>
      ) : (
        <p className="text-3xl font-bold tracking-tight">
          {formatCurrency(data?.cash_in_hand ?? 0, data?.currency)}
        </p>
      )}

      <p className="mt-1 text-xs text-white/60">
        As of {data?.as_of_date ?? "—"}
      </p>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="my-4 border-t border-white/12" />

      {/* ── Cash Recovered Section (merged from DailyCollections) */}
      <div className="flex items-center gap-2 mb-3">
        <Banknote className="h-4 w-4 text-white" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
          Cash Recovered
        </p>
      </div>

      {isLoading ? (
        <div className="h-7 w-36 rounded bg-white/10 animate-pulse mb-3" />
      ) : (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold">
            {formatCurrency(collectionsData?.total_recovered ?? 0)}
          </span>
          <span className="text-xs text-white/60">
            {collectionsData?.payment_count ?? 0} payments
          </span>
        </div>
      )}

      {/* Per-type breakdown */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        {(["daily", "weekly", "monthly"] as const).map((type) => {
          const entry = collectionsData?.by_loan_type[type];
          return (
            <div
              key={type}
              className="space-y-0.5 rounded-lg bg-white/8 p-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60 capitalize">
                {type}
              </p>
              <p className="text-sm font-bold text-white">
                {formatCurrency(entry?.total_amount ?? 0)}
              </p>
              <p className="text-[11px] text-white/60">
                {entry?.count ?? 0} txns
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { formatCurrency };
