import { Wallet, Banknote } from "lucide-react";
import type { CashPositionData, DailyCollectionsData } from "@/types/dashboard.types";

// ── Helpers ────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string = "NGN"): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
  return amount.toLocaleString("en-US", { style: "currency", currency });
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
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 shadow-lg relative overflow-hidden h-full flex flex-col">
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/5" />

      {/* ── Cash on Hand Section ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">
          Cash on Hand
        </p>
        <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Wallet className="h-4.5 w-4.5 text-emerald-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="h-9 w-48 rounded bg-white/10 animate-pulse" />
      ) : isError ? (
        <p className="text-lg text-red-300">Unable to load</p>
      ) : (
        <p className="text-3xl font-bold tracking-tight">
          {formatCurrency(data?.cash_in_hand ?? 0, data?.currency)}
        </p>
      )}

      <p className="text-xs text-slate-400 mt-1">
        As of {data?.as_of_date ?? "—"}
      </p>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="my-4 border-t border-white/10" />

      {/* ── Cash Recovered Section (merged from DailyCollections) */}
      <div className="flex items-center gap-2 mb-3">
        <Banknote className="h-4 w-4 text-emerald-400" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">
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
          <span className="text-xs text-slate-400">
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
              className="rounded-lg bg-white/5 p-2.5 space-y-0.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 capitalize">
                {type}
              </p>
              <p className="text-sm font-bold text-white">
                {formatCurrency(entry?.total_amount ?? 0)}
              </p>
              <p className="text-[11px] text-slate-400">
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
