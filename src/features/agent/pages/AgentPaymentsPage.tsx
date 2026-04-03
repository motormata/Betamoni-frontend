import { useState } from "react";
import { CreditCard, Search, Filter, Trash2, Plus } from "lucide-react";
import {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
} from "@/api/endpoints/paymentApi";
import type { PaymentMethod } from "@/types/payment.types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";

// ── Agent Payments Page ────────────────────────────────────────────

export function AgentPaymentsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={CreditCard}
        title="Payments"
        description="Record and view borrower repayments"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
             Payment
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
            placeholder="Paste Loan ID"
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
            <option value="bank_transfer">Transfer</option>
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
  const [loanId, setLoanId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<{
    page: number;
    loan_id?: string;
    from_date?: string;
    to_date?: string;
  }>({ page: 1 });

  const { data: res, isLoading, isError, isFetching } = useGetPaymentsQuery(filters);

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setFilters({
      page: 1,
      ...(loanId.trim() && { loan_id: loanId.trim() }),
      ...(fromDate && { from_date: fromDate }),
      ...(toDate && { to_date: toDate }),
    });
  }

  function clearFilters() {
    setLoanId("");
    setFromDate("");
    setToDate("");
    setFilters({ page: 1 });
  }

  const payments = res?.data?.data ?? [];
  const pagination = res?.data;
  const hasActiveFilters = Boolean(
    filters.loan_id || filters.from_date || filters.to_date
  );

  return (
    <div className="space-y-3">
      {/* Filters Card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header Toggle */}
        <div
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer md:cursor-default md:pointer-events-none"
        >
          <p className="text-sm font-semibold text-foreground">Filter payment</p>
          <div className="flex items-center gap-3">
            {/* Desktop parallel submit button */}
            <div className="hidden md:flex items-center gap-2 pointer-events-auto">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Clear filters"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearch();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/20 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>
            {/* Mobile Filter Icon */}
            <div className="md:hidden pointer-events-auto flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="p-1.5 rounded-lg bg-muted text-foreground">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Form Body */}
        <div
          className={`px-4 pb-4 md:block border-t border-border/40 md:border-t-0 space-y-3 md:space-y-0 ${
            showFilters ? "block" : "hidden"
          }`}
        >
          {/* Mobile Submit Button at Top */}
          <div className="md:hidden pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                handleSearch();
                setShowFilters(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Apply Filter
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row md:items-end gap-3 w-full"
          >
            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">
                Loan ID
              </label>
              <input
                type="text"
                placeholder="Paste Loan ID"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                className="input-field mt-1 md:mt-2 font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:flex-1">
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input-field mt-1 md:mt-2"
                />
              </div>
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input-field mt-1 md:mt-2"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load payments" />}
        {!isLoading && !isError && payments.length === 0 && (
          <EmptyState message="No payments found matching your filters" />
        )}

        {payments.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar relative">
            {isFetching && (
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/20 animate-pulse" />
            )}
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

                  {/* Render nested borrower information if available */}
                  {(p.loan?.borrower?.full_name || p.loan?.loan_number) && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mt-1">
                      {p.loan.borrower?.full_name && (
                        <span className="truncate flex-1 max-w-[150px]">{p.loan.borrower.full_name}</span>
                      )}
                      {p.loan.borrower?.full_name && p.loan.loan_number && <span>·</span>}
                      {p.loan.loan_number && <span>{p.loan.loan_number}</span>}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {new Date(p.payment_date).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                    {" "}
                    {"payment_time" in p && p.payment_time ? `at ${p.payment_time}` : ""}
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
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
