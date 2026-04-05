import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Banknote, Calendar, Clock, User2, CreditCard,
  CheckCircle2, CircleDot, Hash, TrendingUp, Wallet, AlertCircle,
} from "lucide-react";
import { useGetAgentLoanByIdQuery } from "@/api/endpoints/agentApi";
import { useCreatePaymentMutation } from "@/api/endpoints/paymentApi";
import type { PaymentMethod } from "@/types/payment.types";
import type { AgentLoan } from "@/types/agent.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/FeedbackStates";
import { formatCurrency } from "@/lib/formatters";

// ── Repayment Schedule Calculator ─────────────────────────────────

function useRepaymentSchedule(loan: AgentLoan | undefined) {
  return useMemo(() => {
    if (!loan) return null;

    const totalAmount  = Number(loan.total_amount ?? 0) || Number(loan.principal_amount);
    const amountPaid   = Number(loan.amount_paid ?? 0);
    const balance      = Number(loan.balance ?? totalAmount - amountPaid);
    const durationDays = loan.duration_days;
    const frequency    = loan.repayment_frequency;

    // Repayment count based on frequency
    let installmentCount: number;
    switch (frequency) {
      case "weekly":    installmentCount = Math.ceil(durationDays / 7);  break;
      case "bi-weekly": installmentCount = Math.ceil(durationDays / 14); break;
      case "monthly":   installmentCount = Math.ceil(durationDays / 30); break;
      case "daily":
      default:          installmentCount = durationDays;
    }

    // Use API installment_amount if set, else calculate
    const installmentAmount =
      loan.installment_amount != null && Number(loan.installment_amount) > 0
        ? Number(loan.installment_amount)
        : totalAmount / installmentCount;

    // How many full installments worth of payment have been made
    const completedInstallments = Math.floor(amountPaid / installmentAmount);
    const progressPercent = totalAmount > 0
      ? Math.min((amountPaid / totalAmount) * 100, 100)
      : 0;
    const isComplete = balance <= 0 || loan.status === "completed";

    return {
      totalAmount,
      amountPaid,
      balance,
      installmentAmount,
      installmentCount,
      completedInstallments,
      progressPercent,
      isComplete,
      frequency,
    };
  }, [loan]);
}

// ── Agent Loan Detail Page ─────────────────────────────────────────

export function AgentLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, isError, refetch } = useGetAgentLoanByIdQuery(id!, { skip: !id });
  const loan = res?.data;
  const schedule = useRepaymentSchedule(loan);

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const canPay = loan?.status === "active" || loan?.status === "disbursed";

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

      {loan && schedule && (
        <>
          {/* ── Header card ──────────────────────────── */}
          <div className="rounded-xl border bg-card p-4 space-y-4">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none">
                    {formatCurrency(loan.principal_amount)}
                  </p>
                  {loan.loan_number && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {loan.loan_number}
                    </p>
                  )}
                  {loan.borrower && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {loan.borrower.full_name ?? `${loan.borrower.first_name} ${loan.borrower.last_name}`}
                      {" · "}
                      {loan.borrower.phone}
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge status={loan.status} />
            </div>

            {/* Financial summary row */}
            <div className="grid grid-cols-3 gap-2">
              <FinanceTile label="Total" value={formatCurrency(schedule.totalAmount)} color="text-foreground" />
              <FinanceTile label="Paid" value={formatCurrency(schedule.amountPaid)} color="text-emerald-600" />
              <FinanceTile label="Balance" value={formatCurrency(schedule.balance)} color={schedule.balance > 0 ? "text-amber-600" : "text-emerald-600"} />
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Repayment progress</span>
                <span className="font-semibold">{schedule.progressPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${schedule.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Record Payment button */}
            {canPay && (
              <button
                type="button"
                onClick={() => setShowPaymentForm((p) => !p)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                {showPaymentForm ? "Cancel" : "Record Payment"}
              </button>
            )}
          </div>

          {/* ── Payment form ─────────────────────────── */}
          {showPaymentForm && (
            <InlinePaymentForm
              loanId={id!}
              defaultAmount={schedule.installmentAmount}
              onSuccess={() => {
                setShowPaymentForm(false);
                refetch();
              }}
            />
          )}

          {/* ── Repayment schedule summary ────────────── */}
          <RepaymentScheduleCard schedule={schedule} />

          {/* ── Payment history ───────────────────────── */}
          {loan.payments && loan.payments.length > 0 && (
            <PaymentHistoryCard payments={loan.payments} />
          )}

          {/* ── Loan details grid ─────────────────────── */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Loan Details
            </p>
            <div className="grid grid-cols-2 gap-2">
              <InfoRow icon={TrendingUp} label="Interest Rate" value={`${loan.interest_rate}%`} />
              <InfoRow icon={Wallet} label="Interest Amt" value={formatCurrency(loan.interest_amount ?? 0)} />
              <InfoRow icon={Calendar} label="Duration" value={`${loan.duration_days} days`} />
              <InfoRow icon={Clock} label="Frequency" value={capitalize(String(loan.repayment_frequency))} />
              {loan.disbursement_date && (
                <InfoRow icon={Calendar} label="Disbursed" value={fmtDate(loan.disbursement_date)} />
              )}
              {loan.due_date && (
                <InfoRow icon={Calendar} label="Due Date" value={fmtDate(loan.due_date)} color={new Date(loan.due_date) < new Date() && !schedule.isComplete ? "text-destructive" : undefined} />
              )}
              {loan.quantity && (
                <InfoRow icon={Hash} label="Quantity" value={String(loan.quantity)} />
              )}
              {loan.borrower && (
                <InfoRow icon={User2} label="Borrower" value={loan.borrower.full_name ?? `${loan.borrower.first_name} ${loan.borrower.last_name}`} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Repayment Schedule Card ────────────────────────────────────────

interface ScheduleInfo {
  installmentAmount: number;
  installmentCount: number;
  completedInstallments: number;
  frequency: string;
  isComplete: boolean;
}

function RepaymentScheduleCard({ schedule }: { schedule: ScheduleInfo }) {
  const freqLabel: Record<string, string> = {
    daily: "day", weekly: "week", "bi-weekly": "fortnight", monthly: "month",
  };

  const remaining = schedule.installmentCount - schedule.completedInstallments;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Repayment Schedule
      </p>

      {/* Installment amount highlight */}
      <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Per {freqLabel[schedule.frequency] ?? schedule.frequency}</p>
          <p className="text-xl font-bold text-primary mt-0.5">
            {formatCurrency(schedule.installmentAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Repayments</p>
          <p className="text-xl font-bold mt-0.5">
            {schedule.completedInstallments}
            <span className="text-sm font-normal text-muted-foreground">/{schedule.installmentCount}</span>
          </p>
        </div>
      </div>

      {/* Installment dot grid — show up to 30 dots */}
      {schedule.installmentCount <= 31 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Array.from({ length: schedule.installmentCount }).map((_, i) => {
            const done = i < schedule.completedInstallments;
            const current = i === schedule.completedInstallments;
            return (
              <div
                key={i}
                title={`${capitalize(schedule.frequency)} ${i + 1}`}
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : current
                    ? "border-2 border-primary text-primary bg-primary/10"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
            );
          })}
        </div>
      )}

      {/* Status line */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {schedule.isComplete ? (
          <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Loan fully repaid</>
        ) : remaining > 0 ? (
          <><CircleDot className="h-3.5 w-3.5 text-amber-500" /> {remaining} {remaining === 1 ? "repayment" : "repayments"} remaining</>
        ) : (
          <><AlertCircle className="h-3.5 w-3.5 text-destructive" /> Overdue</>
        )}
      </div>
    </div>
  );
}

// ── Payment History Card ───────────────────────────────────────────

function PaymentHistoryCard({ payments }: { payments: NonNullable<AgentLoan["payments"]> }) {
  const methodLabel: Record<string, string> = {
    cash: "Cash", bank_transfer: "Transfer", pos: "POS",
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Payment History · {payments.length} recorded
        </p>
      </div>
      <ul className="divide-y divide-border">
        {[...payments].reverse().map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-emerald-600">
                  +{formatCurrency(p.amount)}
                </p>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {methodLabel[p.payment_method] ?? p.payment_method}
                </span>
                {p.is_verified && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              {p.receipt_number && (
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  {p.receipt_number}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground shrink-0">
              {fmtDate(p.payment_date)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Inline Payment Form ────────────────────────────────────────────

function InlinePaymentForm({
  loanId,
  defaultAmount,
  onSuccess,
}: {
  loanId: string;
  defaultAmount: number;
  onSuccess: () => void;
}) {
  const [createPayment, { isLoading, isError, error }] = useCreatePaymentMutation();

  const [amount, setAmount] = useState(String(Math.round(defaultAmount)));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentMethod) return;

    const result = await createPayment({
      loan_id: loanId,
      amount: Number(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod as PaymentMethod,
    });

    if ("data" in result) onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Record Payment</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Amount (₦) *
            <span className="ml-1 text-muted-foreground/60">suggested: {formatCurrency(defaultAmount)}</span>
          </label>
          <input
            type="number"
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
          <label className="text-xs font-medium text-muted-foreground">Method *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="input-field mt-1"
            required
          >
            <option value="">Select</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="pos">POS</option>
          </select>
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to record payment"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !paymentMethod}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Recording…" : "Record Payment"}
      </button>
    </form>
  );
}

// ── Small UI Helpers ───────────────────────────────────────────────

function FinanceTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold truncate ${color ?? "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
