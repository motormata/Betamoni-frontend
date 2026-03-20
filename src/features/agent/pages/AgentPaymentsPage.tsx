import { useState } from "react";
import { CreditCard, Search } from "lucide-react";
import {
  useCreatePaymentMutation,
  useLazyGetPaymentsQuery,
} from "@/api/endpoints/paymentApi";
import type { PaymentMethod } from "@/types/payment.types";
import { AgentPageHeader } from "../components/AgentPageHeader";
import { Pagination } from "../components/Pagination";
import { LoadingState, ErrorState, EmptyState } from "../components/FeedbackStates";

// ── Agent Payments Page ────────────────────────────────────────────

export function AgentPaymentsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <AgentPageHeader
        icon={CreditCard}
        title="Payments"
        description="Record and view borrower repayments"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Record Payment
          </button>
        }
      />

      {showForm && <RecordPaymentForm onSuccess={() => setShowForm(false)} />}

      <PaymentHistory />
    </div>
  );
}

// ── Record Payment Form ────────────────────────────────────────────

function RecordPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const [createPayment, { isLoading, isError, error }] = useCreatePaymentMutation();

  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [repaymentScheduleId, setRepaymentScheduleId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loanId.trim() || !paymentMethod) return;

    const result = await createPayment({
      loan_id: loanId.trim(),
      amount: Number(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod as PaymentMethod,
      ...(repaymentScheduleId.trim() && {
        repayment_schedule_id: repaymentScheduleId.trim(),
      }),
    });

    if ("data" in result) {
      onSuccess();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Record New Payment</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Loan ID *</label>
          <input
            type="text"
            placeholder="e.g. 019d02a5-2dd0-..."
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            className="input-field mt-1 font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Amount (₦) *</label>
          <input
            type="number"
            placeholder="e.g. 2500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Payment Date *</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Payment Method *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="input-field mt-1"
            required
          >
            <option value="">Select</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="pos">POS</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Schedule ID <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="UUID"
            value={repaymentScheduleId}
            onChange={(e) => setRepaymentScheduleId(e.target.value)}
            className="input-field mt-1 font-mono text-sm"
          />
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to record payment"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Recording…" : "Record Payment"}
      </button>
    </form>
  );
}

// ── Payment History ────────────────────────────────────────────────

function PaymentHistory() {
  const [trigger, result] = useLazyGetPaymentsQuery();

  // Filters
  const [loanId, setLoanId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    trigger({
      ...(loanId.trim() && { loan_id: loanId.trim() }),
      ...(fromDate && { from_date: fromDate }),
      ...(toDate && { to_date: toDate }),
    });
  }

  const payments = result.data?.data?.data ?? [];
  const pagination = result.data?.data;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="rounded-xl border bg-card p-4 space-y-3"
      >
        <p className="text-sm font-semibold">Payment History</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Loan ID</label>
            <input
              type="text"
              placeholder="Filter by loan UUID"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              className="input-field mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/10 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/20 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          Search Payments
        </button>
      </form>

      {/* Results */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {result.isLoading && <LoadingState />}
        {result.isError && <ErrorState message="Failed to load payments" />}
        {result.isUninitialized && (
          <EmptyState message="Use the filters above to search for payments" />
        )}
        {result.isSuccess && payments.length === 0 && (
          <EmptyState message="No payments found matching your filters" />
        )}

        {payments.length > 0 && (
          <ul className="divide-y divide-border">
            {payments.map((p) => (
              <li key={p.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    ₦{Number(p.amount).toLocaleString()}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-full ring-1 ring-inset bg-muted text-muted-foreground ring-border capitalize">
                    {p.payment_method}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.payment_date} · <span className="font-mono">{p.loan_id}</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        {pagination && (
          <div className="px-4 pb-3">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              onPageChange={(p) => {
                setPage(p);
                trigger({
                  ...(loanId.trim() && { loan_id: loanId.trim() }),
                  ...(fromDate && { from_date: fromDate }),
                  ...(toDate && { to_date: toDate }),
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
