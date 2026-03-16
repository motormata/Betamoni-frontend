import { Wallet } from "lucide-react";
import type { CashPositionData } from "@/types/dashboard.types";

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
  isLoading?: boolean;
  isError?: boolean;
}

export function CashPositionCard({
  data,
  isLoading,
  isError,
}: CashPositionCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/5" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">
          Cash on Hand
        </p>
        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-emerald-400" />
        </div>
      </div>

      {/* Value */}
      {isLoading ? (
        <div className="h-9 w-48 rounded bg-white/10 animate-pulse" />
      ) : isError ? (
        <p className="text-lg text-red-300">Unable to load</p>
      ) : (
        <p className="text-3xl font-bold tracking-tight">
          {formatCurrency(data?.cash_in_hand ?? 0, data?.currency)}
        </p>
      )}

      {/* Divider */}
      <div className="my-4 border-t border-white/10" />

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          As of {data?.as_of_date ?? "—"}
        </span>
      </div>
    </div>
  );
}

export { formatCurrency };
