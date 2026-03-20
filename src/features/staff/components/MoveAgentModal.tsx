import { useState } from "react";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAssignMarketMutation } from "@/api/endpoints/staffApi";
import { useGetMarketsQuery } from "@/api/endpoints/dashboardApi";
import type { StaffUser } from "@/types/staff.types";

// ── Props ──────────────────────────────────────────────────────────

interface MoveAgentModalProps {
  agent: StaffUser;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export function MoveAgentModal({ agent, onClose }: MoveAgentModalProps) {
  const { data: marketsRes, isLoading: marketsLoading } = useGetMarketsQuery();
  const [assignMarket, { isLoading }] = useAssignMarketMutation();

  const markets = marketsRes?.data ?? [];
  const [selectedMarketId, setSelectedMarketId] = useState<string>("");
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMarketId) return;
    setResult(null);

    try {
      await assignMarket({
        userId: agent.id,
        market_id: selectedMarketId,
      }).unwrap();

      const newMarket = markets.find((m) => String(m.id) === selectedMarketId);
      setResult({
        type: "success",
        message: `${agent.name} has been moved to ${newMarket?.name ?? "selected market"}.`,
      });
      setSelectedMarketId("");
    } catch (err: any) {
      const msg =
        err?.data?.message ?? "Failed to assign market. Please try again.";
      setResult({ type: "error", message: msg });
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-sm font-semibold">Move Agent</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reassign agent to a new market
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Result Banner */}
          {result && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                result.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <p>{result.message}</p>
            </div>
          )}

          {/* Agent info */}
          <div className="rounded-lg bg-muted/30 border px-4 py-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-emerald-600">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{agent.name}</p>
              <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
            </div>
          </div>

          {/* Current market (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Current Market
            </label>
            <input
              type="text"
              value={agent.market?.name ?? "Unassigned"}
              readOnly
              className="input-field bg-muted/30 cursor-not-allowed opacity-70"
            />
          </div>

          {/* New market select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Move To Market <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="input-field"
              required
              disabled={marketsLoading}
            >
              <option value="">
                {marketsLoading ? "Loading markets..." : "Select a market"}
              </option>
              {markets
                .filter((m) => String(m.id) !== agent.market_id)
                .map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedMarketId || isLoading}
              className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Moving..." : "Confirm Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
