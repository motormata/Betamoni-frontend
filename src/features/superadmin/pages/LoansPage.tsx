import { useState } from "react";
import { Banknote, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAddCapitalMutation } from "@/api/endpoints/financeApi";

// ── Finance Page (Super-Admin Loans) ───────────────────────────────

export function LoansPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Finance"
        description="Manage capital and financial operations"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Capital
          </button>
        }
      />

      {showForm && (
        <AddCapitalForm onSuccess={() => setShowForm(false)} />
      )}

      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Additional financial reports and loan management features coming soon.
        </p>
      </div>
    </div>
  );
}

// ── Add Capital Form ───────────────────────────────────────────────

function AddCapitalForm({ onSuccess }: { onSuccess: () => void }) {
  const [addCapital, { isLoading, isError, error }] = useAddCapitalMutation();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await addCapital({
      amount: Number(amount),
      description: description.trim(),
      transaction_date: transactionDate,
    });

    if ("data" in result) {
      setAmount("");
      setDescription("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
      onSuccess();
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
            type="number"
            placeholder="e.g. 1000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field mt-1"
            min="1"
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
          {(error as any)?.data?.message ?? "Failed to add capital"}
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
