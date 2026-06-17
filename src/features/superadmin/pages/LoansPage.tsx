import { useState } from "react";
import { Banknote, Plus, Calendar, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { LoadingState, EmptyState } from "@/components/shared/FeedbackStates";
import { useAddCapitalMutation, useGetFinanceHistoryQuery } from "@/api/endpoints/financeApi";
import { formatAmountInput, formatCurrency, parseAmountInput } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

// ── Finance Page ───────────────────────────────────────────────────

export function LoansPage() {
  const [showForm, setShowForm] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const { data: historyRes, isLoading: historyLoading } = useGetFinanceHistoryQuery(historyPage);

  const entries = historyRes?.data?.data ?? [];
  const pagination = historyRes?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Finance"
        description="Manage capital injections and view financial history"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Capital
          </button>
        }
      />

      {showForm && (
        <AddCapitalForm onSuccess={() => setShowForm(false)} />
      )}

      {/* Capital History */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-semibold">Capital Injection History</p>
        </div>

        {historyLoading && <LoadingState />}
        {!historyLoading && entries.length === 0 && (
          <EmptyState message="No capital injections recorded yet." />
        )}

        {entries.length > 0 && (
          <div className="max-h-[55vh] overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-border">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                      <DollarSign className="h-4 w-4 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{entry.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>
                          {entry.transaction_date
                            ? new Date(entry.transaction_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-success">
                    +{formatCurrency(entry.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && (
          <div className="px-4 pb-3">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              totalItems={pagination.total}
              fromItem={pagination.from}
              toItem={pagination.to}
              onPageChange={setHistoryPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Capital Form ───────────────────────────────────────────────

function AddCapitalForm({ onSuccess }: { onSuccess: () => void }) {
  const [addCapital, { isLoading, isError, error }] = useAddCapitalMutation();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseAmountInput(amount);

    try {
      await addCapital({
        amount: parsedAmount,
        description: description.trim(),
        transaction_date: transactionDate,
      }).unwrap();

      toast({
        title: "Capital added",
        description: `${formatCurrency(parsedAmount)} has been added to the finance ledger.`,
      });
      setAmount("");
      setDescription("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
      onSuccess();
    } catch {
      // Inline error text keeps the correction next to the fields.
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Add Capital</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Amount *</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1000000"
            value={amount}
            onChange={(e) => setAmount(formatAmountInput(e.target.value))}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description *</label>
          <input
            type="text"
            placeholder="e.g. Seed funding"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Transaction Date *</label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(error, "Failed to add capital")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Adding…" : "Add Capital"}
      </button>
    </form>
  );
}
