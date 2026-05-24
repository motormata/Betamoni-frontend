import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  CreditCard,
  Hash,
  TrendingUp,
  User2,
  Wallet,
} from "lucide-react";
import { useGetAgentLoanByIdQuery } from "@/api/endpoints/agentApi";
import { useCreatePaymentMutation } from "@/api/endpoints/paymentApi";
import type { PaymentMethod } from "@/types/payment.types";
import type { AgentLoan } from "@/types/agent.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState, LoadingState } from "@/components/shared/FeedbackStates";
import { formatCurrency } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { hasTrackedSearchParams } from "@/lib/listSearchParams";
import {
  isRepayableAgentLoanStatus,
  markAgentLoanOpened,
  markAgentLoanPaid,
} from "@/lib/agentLoanDailyActivity";
import { useAppSelector } from "@/store/hooks";

const INSTALLMENT_TOLERANCE = 0.5;

interface RepaymentInstallment {
  index: number;
  dueDate: Date | null;
  status: "paid" | "missed" | "pending";
}

interface ScheduleInfo {
  totalAmount: number;
  amountPaid: number;
  balance: number;
  installmentAmount: number;
  installmentCount: number;
  completedInstallments: number;
  missedInstallments: number;
  progressPercent: number;
  isComplete: boolean;
  frequency: string;
  todayInstallmentIndex: number | null;
  installments: RepaymentInstallment[];
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function isWeekend(value: Date): boolean {
  const day = value.getDay();
  return day === 0 || day === 6;
}

function nextWorkingDay(value: Date): Date {
  const date = startOfDay(value);

  while (isWeekend(date)) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

function addWorkingDays(baseDate: Date, days: number): Date {
  const date = startOfDay(baseDate);
  let daysAdded = 0;

  while (daysAdded < days) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      daysAdded += 1;
    }
  }

  return date;
}

function parseLoanDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return startOfDay(parsed);
}

function addInstallmentStep(baseDate: Date, frequency: string, step: number): Date {
  const nextDate = new Date(baseDate);

  switch (frequency) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + step * 7);
      break;
    case "bi-weekly":
      nextDate.setDate(nextDate.getDate() + step * 14);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + step);
      break;
    case "daily":
    default:
      return addWorkingDays(baseDate, step);
  }

  return nextWorkingDay(nextDate);
}

function isSameDay(left: Date | null, right: Date): boolean {
  return left?.getTime() === right.getTime();
}

function roundUpAmount(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.ceil(num));
}

function readPositiveNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function getBackendInstallmentAmount(loan: AgentLoan | undefined): number | null {
  if (!loan) return null;

  const looseLoan = loan as AgentLoan & { installmentAmount?: unknown };
  return readPositiveNumber(loan.installment_amount) ?? readPositiveNumber(looseLoan.installmentAmount);
}

function normalizePaymentDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const dateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (dateMatch) return dateMatch[0];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
}

function useRepaymentSchedule(loan: AgentLoan | undefined) {
  return useMemo<ScheduleInfo | null>(() => {
    if (!loan) return null;

    const totalAmount = Number(loan.total_amount ?? 0) || Number(loan.principal_amount);
    const amountPaid = Number(loan.amount_paid ?? 0);
    const balance = Number(loan.balance ?? totalAmount - amountPaid);
    const durationDays = loan.duration_days;
    const frequency = loan.repayment_frequency;

    let installmentCount: number;
    switch (frequency) {
      case "weekly":
        installmentCount = Math.ceil(durationDays / 7);
        break;
      case "bi-weekly":
        installmentCount = Math.ceil(durationDays / 14);
        break;
      case "monthly":
        installmentCount = Math.ceil(durationDays / 30);
        break;
      case "daily":
      default:
        installmentCount = durationDays;
        break;
    }

    const installmentAmount = getBackendInstallmentAmount(loan) ?? totalAmount / installmentCount;

    const progressPercent =
      totalAmount > 0 ? Math.min((amountPaid / totalAmount) * 100, 100) : 0;
    const isComplete = balance <= 0 || loan.status === "completed";

    const originDate = parseLoanDate(
      loan.disbursement_date ?? loan.disbursed_at ?? loan.created_at,
    );
    const today = startOfDay(new Date());

    const baseInstallments = Array.from({ length: installmentCount }, (_, index) => ({
      index,
      dueDate: originDate ? addInstallmentStep(originDate, frequency, index + 1) : null,
      status: "pending" as const,
    }));

    const allocatedInstallments = new Set<number>();
    const sortedPayments = [...(loan.payments ?? [])].sort((left, right) => {
      const leftTime = parseLoanDate(left.payment_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightTime = parseLoanDate(right.payment_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;

      if (leftTime !== rightTime) return leftTime - rightTime;
      return String(left.id).localeCompare(String(right.id));
    });

    const findNextInstallmentIndex = (paymentDate: Date | null): number | null => {
      if (paymentDate) {
        const dueInstallment = baseInstallments.find(
          (installment) =>
            !allocatedInstallments.has(installment.index) &&
            installment.dueDate != null &&
            installment.dueDate.getTime() <= paymentDate.getTime(),
        );

        if (dueInstallment) {
          return dueInstallment.index;
        }
      }

      return (
        baseInstallments.find(
          (installment) => !allocatedInstallments.has(installment.index),
        )?.index ?? null
      );
    };

    sortedPayments.forEach((payment) => {
      const paymentDate = parseLoanDate(payment.payment_date);
      let remainingAmount = Number(payment.amount ?? 0);

      const firstInstallmentIndex = findNextInstallmentIndex(paymentDate);
      if (firstInstallmentIndex == null) return;

      allocatedInstallments.add(firstInstallmentIndex);
      remainingAmount -= installmentAmount;

      while (remainingAmount + INSTALLMENT_TOLERANCE >= installmentAmount) {
        const extraInstallmentIndex = findNextInstallmentIndex(paymentDate);
        if (extraInstallmentIndex == null) break;

        allocatedInstallments.add(extraInstallmentIndex);
        remainingAmount -= installmentAmount;
      }
    });

    const installments = baseInstallments.map((installment) => {
      if (allocatedInstallments.has(installment.index)) {
        return { ...installment, status: "paid" as const };
      }

      if (installment.dueDate && installment.dueDate < today) {
        return { ...installment, status: "missed" as const };
      }

      return installment;
    });

    const completedInstallments = installments.filter(
      (installment) => installment.status === "paid",
    ).length;
    const missedInstallments = installments.filter(
      (installment) => installment.status === "missed",
    ).length;
    const todayInstallmentIndex =
      baseInstallments.find((installment) => isSameDay(installment.dueDate, today))?.index ??
      null;

    return {
      totalAmount,
      amountPaid,
      balance,
      installmentAmount,
      installmentCount,
      completedInstallments,
      missedInstallments,
      progressPercent,
      isComplete,
      frequency,
      todayInstallmentIndex,
      installments,
    };
  }, [loan]);
}

export function AgentLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const agentId = useAppSelector((state) => state.auth.user?.id);
  const { data: res, isLoading, isError, refetch } = useGetAgentLoanByIdQuery(id!, {
    skip: !id,
  });
  const loan = res?.data;
  const schedule = useRepaymentSchedule(loan);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const normalizedStatus = loan?.status?.toLowerCase().trim();
  const canPay =
    normalizedStatus === "active" ||
    normalizedStatus === "disbursed" ||
    normalizedStatus === "defaulted";
  const loanSearchParams = new URLSearchParams(location.search);
  const backTarget = hasTrackedSearchParams(loanSearchParams, ["page"])
    ? { pathname: "/loans", search: location.search }
    : "/loans";
  const preferredInstallmentAmount =
    getBackendInstallmentAmount(loan) ?? schedule?.installmentAmount ?? 0;

  useEffect(() => {
    if (!loan || !isRepayableAgentLoanStatus(loan.status)) return;

    markAgentLoanOpened(agentId, loan.id);
  }, [agentId, loan]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <button
        type="button"
        onClick={() => navigate(backTarget)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loans
      </button>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load loan details" />}

      {loan && schedule && (
        <>
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-none">
                    {formatCurrency(loan.principal_amount)}
                  </p>
                  {loan.loan_number && (
                    <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                      {loan.loan_number}
                    </p>
                  )}
                  {loan.borrower && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {loan.borrower.full_name ??
                        `${loan.borrower.first_name} ${loan.borrower.last_name}`}
                      {" · "}
                      {loan.borrower.phone}
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge status={loan.status} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <FinanceTile
                label="Total"
                value={formatCurrency(schedule.totalAmount)}
                color="text-foreground"
              />
              <FinanceTile
                label="Paid"
                value={formatCurrency(schedule.amountPaid)}
                color="text-success"
              />
              <FinanceTile
                label="Balance"
                value={formatCurrency(schedule.balance)}
                color={schedule.balance > 0 ? "text-warning" : "text-success"}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Repayment progress</span>
                <span className="font-semibold">{schedule.progressPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${schedule.progressPercent}%` }}
                />
              </div>
            </div>

            {canPay && (
              <button
                type="button"
                onClick={() => setShowPaymentForm((prev) => !prev)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <CreditCard className="h-4 w-4" />
                {showPaymentForm ? "Cancel" : "Record Payment"}
              </button>
            )}
          </div>

          {showPaymentForm && (
            <InlinePaymentForm
              loanId={id!}
              agentId={agentId}
              defaultAmount={preferredInstallmentAmount}
              payments={loan.payments ?? []}
              onSuccess={() => {
                setShowPaymentForm(false);
                refetch();
              }}
            />
          )}

          <RepaymentScheduleCard schedule={schedule} />

          {loan.payments && loan.payments.length > 0 && (
            <PaymentHistoryCard payments={loan.payments} />
          )}

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Loan Details
            </p>
            <div className="grid grid-cols-2 gap-2">
              <InfoRow
                icon={TrendingUp}
                label="Interest Rate"
                value={`${loan.interest_rate}%`}
              />
              <InfoRow
                icon={Wallet}
                label="Interest Amt"
                value={formatCurrency(loan.interest_amount ?? 0)}
              />
              <InfoRow
                icon={Calendar}
                label="Duration"
                value={`${loan.duration_days} days`}
              />
              <InfoRow
                icon={Clock}
                label="Frequency"
                value={capitalize(String(loan.repayment_frequency))}
              />
              {loan.disbursement_date && (
                <InfoRow
                  icon={Calendar}
                  label="Disbursed"
                  value={fmtDate(loan.disbursement_date)}
                />
              )}
              {loan.due_date && (
                <InfoRow
                  icon={Calendar}
                  label="Due Date"
                  value={fmtDate(loan.due_date)}
                  color={
                    new Date(loan.due_date) < new Date() && !schedule.isComplete
                      ? "text-destructive"
                      : undefined
                  }
                />
              )}
              {loan.quantity && (
                <InfoRow icon={Hash} label="Quantity" value={String(loan.quantity)} />
              )}
              {loan.borrower && (
                <InfoRow
                  icon={User2}
                  label="Borrower"
                  value={
                    loan.borrower.full_name ??
                    `${loan.borrower.first_name} ${loan.borrower.last_name}`
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RepaymentScheduleCard({ schedule }: { schedule: ScheduleInfo }) {
  const freqLabel: Record<string, string> = {
    daily: "day",
    weekly: "week",
    "bi-weekly": "fortnight",
    monthly: "month",
  };

  const pendingInstallments = schedule.installments.filter(
    (installment) => installment.status === "pending",
  ).length;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Repayment Schedule
      </p>

      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Per {freqLabel[schedule.frequency] ?? schedule.frequency}
          </p>
          <p className="mt-0.5 text-xl font-bold text-primary">
            {formatCurrency(schedule.installmentAmount)}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {schedule.todayInstallmentIndex != null
              ? `Today: repayment ${schedule.todayInstallmentIndex + 1} of ${
                  schedule.installmentCount
                }`
              : "Today: no repayment due"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Repayments</p>
          <p className="mt-0.5 text-xl font-bold">
            {schedule.completedInstallments}
            <span className="text-sm font-normal text-muted-foreground">
              /{schedule.installmentCount}
            </span>
          </p>
        </div>
      </div>

      {schedule.installmentCount <= 31 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {schedule.installments.map((installment) => {
            const titleDate = installment.dueDate
              ? fmtDate(installment.dueDate)
              : "Date unavailable";
            const dotClass =
              installment.status === "paid"
                ? "bg-primary text-primary-foreground"
                : installment.status === "missed"
                ? "bg-danger text-danger-foreground"
                : "bg-muted text-muted-foreground";
            const statusLabel = capitalize(installment.status);

            return (
              <div
                key={installment.index}
                title={`${capitalize(schedule.frequency)} ${
                  installment.index + 1
                } - ${statusLabel} - ${titleDate}`}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${dotClass}`}
              >
                {installment.status === "paid" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  installment.index + 1
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {schedule.isComplete ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Loan fully repaid
            </>
          ) : pendingInstallments > 0 ? (
            <>
              <CircleDot className="h-3.5 w-3.5 text-warning" />
              {pendingInstallments} pending{" "}
              {pendingInstallments === 1 ? "repayment" : "repayments"}
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              Overdue
            </>
          )}
        </div>

        {schedule.missedInstallments > 0 && (
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="h-3.5 w-3.5" />
            {schedule.missedInstallments} missed{" "}
            {schedule.missedInstallments === 1 ? "schedule" : "schedules"}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentHistoryCard({ payments }: { payments: NonNullable<AgentLoan["payments"]> }) {
  const methodLabel: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Transfer",
    pos: "POS",
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Payment History · {payments.length} recorded
        </p>
      </div>
      <div className="custom-scrollbar max-h-72 overflow-y-auto">
        <ul className="divide-y divide-border">
          {[...payments].reverse().map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-success">
                    +{formatCurrency(payment.amount)}
                  </p>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {methodLabel[payment.payment_method] ?? payment.payment_method}
                  </span>
                  {payment.is_verified && (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                  )}
                </div>
                {payment.receipt_number && (
                  <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                    {payment.receipt_number}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {fmtDate(payment.payment_date)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InlinePaymentForm({
  loanId,
  agentId,
  defaultAmount,
  payments,
  onSuccess,
}: {
  loanId: string;
  agentId?: string;
  defaultAmount: number;
  payments: NonNullable<AgentLoan["payments"]>;
  onSuccess: () => void;
}) {
  const [createPayment, { isLoading, isError, error }] = useCreatePaymentMutation();
  const { toast } = useToast();
  const roundedDefaultAmount = roundUpAmount(defaultAmount);

  const [amount, setAmount] = useState(String(roundedDefaultAmount));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [duplicatePaymentConfirmed, setDuplicatePaymentConfirmed] = useState(false);

  const duplicatePayment = useMemo(
    () =>
      payments.find(
        (payment) => normalizePaymentDate(payment.payment_date) === paymentDate,
      ),
    [paymentDate, payments],
  );
  const hasDuplicatePaymentDate = duplicatePayment != null;
  const shouldBlockSubmitForDuplicate =
    hasDuplicatePaymentDate && !duplicatePaymentConfirmed;

  useEffect(() => {
    setDuplicatePaymentConfirmed(false);
  }, [paymentDate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const roundedAmount = roundUpAmount(amount);
    if (!paymentMethod || roundedAmount < 1 || shouldBlockSubmitForDuplicate) return;

    try {
      await createPayment({
        loan_id: loanId,
        amount: roundedAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod as PaymentMethod,
      }).unwrap();

      markAgentLoanPaid(agentId, loanId);
      toast({
        title: "Payment recorded",
        description: `${formatCurrency(roundedAmount)} has been added to this loan.`,
      });
      onSuccess();
    } catch {
      // Inline error text keeps this correction local to the form.
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in slide-in-from-top-2 rounded-xl border bg-card p-4 space-y-4 duration-200"
    >
      <p className="text-sm font-semibold">Record Payment</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Amount (₦) *
            <span className="ml-1 text-muted-foreground/60">
              suggested: {formatCurrency(roundedDefaultAmount)}
            </span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
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
            onChange={(event) => setPaymentDate(event.target.value)}
            className="input-field mt-1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Method *</label>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="input-field mt-1"
            required
          >
            <option value="">Select</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            {/* <option value="pos">POS</option>*/}
          </select>
        </div>
      </div>

      {hasDuplicatePaymentDate && (
        <div
          className={`rounded-lg border px-3 py-2.5 text-xs ${
            duplicatePaymentConfirmed
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold">
                Repayment has already been recorded for {fmtDate(paymentDate)}.
              </p>
              <p>
                {duplicatePaymentConfirmed
                  ? "Duplicate date confirmed. Submitting will record another payment for this date."
                  : "Confirm before recording another payment for the same date."}
              </p>
              {!duplicatePaymentConfirmed && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplicatePaymentConfirmed(true)}
                    className="rounded-md bg-destructive px-2.5 py-1.5 text-[11px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
                  >
                    Record anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicatePaymentConfirmed(false)}
                    className="rounded-md border border-destructive/30 px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-destructive/10"
                  >
                    Choose another date
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(error, "Failed to record payment")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !paymentMethod || shouldBlockSubmitForDuplicate}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading
          ? "Recording..."
          : hasDuplicatePaymentDate && duplicatePaymentConfirmed
          ? "Record Duplicate Payment"
          : "Record Payment"}
      </button>
    </form>
  );
}

function FinanceTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold ${color}`}>{value}</p>
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
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`truncate text-sm font-semibold ${color ?? "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "—";

  const date =
    value instanceof Date
      ? value
      : value.includes("T")
      ? new Date(value)
      : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
