import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Calendar, Percent, Clock, User2, CreditCard } from "lucide-react";
import { useGetAgentLoanByIdQuery } from "@/api/endpoints/agentApi";
import { useCreatePaymentMutation } from "@/api/endpoints/paymentApi";
import type { PaymentMethod } from "@/types/payment.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/FeedbackStates";
import { DetailCard } from "@/components/shared/DetailCard";

// ── Agent Loan Detail Page ─────────────────────────────────────────

export function AgentLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, isError } = useGetAgentLoanByIdQuery(id!, { skip: !id });
  const loan = res?.data;

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/loans")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loans
      </button>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load loan details" />}

      {loan && (
        <>
          {/* Header */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    ₦{Number(loan.principal_amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{loan.id}</p>
                </div>
              </div>
              <StatusBadge status={loan.status} />
            </div>

            {/* Record Payment Button */}
            <button
              type="button"
              onClick={() => setShowPaymentForm((p) => !p)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              {showPaymentForm ? "Cancel" : "Record Payment"}
            </button>
          </div>

          {/* Inline Repayment Form */}
          {showPaymentForm && (
            <InlinePaymentForm
              loanId={id!}
              onSuccess={() => setShowPaymentForm(false)}
            />
          )}

          {/* Loan Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailCard icon={Percent} label="Interest Rate" value={`${loan.interest_rate}%`} />
            <DetailCard icon={Calendar} label="Duration" value={`${loan.duration_days} days`} />
            <DetailCard icon={Clock} label="Frequency" value={String(loan.repayment_frequency)} />
            <DetailCard icon={User2} label="Borrower ID" value={String(loan.borrower_id)} mono />
            {loan.collection_day != null && (
              <DetailCard icon={Calendar} label="Collection Day" value={String(loan.collection_day)} />
            )}
            {loan.collection_time != null && (
              <DetailCard icon={Clock} label="Collection Time" value={String(loan.collection_time)} />
            )}
            {loan.purpose != null && (
              <DetailCard icon={Banknote} label="Purpose" value={String(loan.purpose)} fullWidth />
            )}
          </div>

          {/* Timestamps */}
          {loan.created_at != null && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Created: {new Date(String(loan.created_at)).toLocaleDateString("en-NG", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          )}

          {/* Raw JSON (dev aid) */}
          <details className="rounded-xl border bg-card">
            <summary className="px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Raw Response
            </summary>
            <pre className="px-4 pb-4 text-xs overflow-auto max-h-60 text-muted-foreground">
              {JSON.stringify(loan, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

// ── Inline Payment Form ────────────────────────────────────────────

function InlinePaymentForm({ loanId, onSuccess }: { loanId: string; onSuccess: () => void }) {
  const [createPayment, { isLoading, isError, error }] = useCreatePaymentMutation();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [repaymentScheduleId, setRepaymentScheduleId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentMethod) return;

    const result = await createPayment({
      loan_id: loanId,
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
      <p className="text-sm font-semibold">Record Payment</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
