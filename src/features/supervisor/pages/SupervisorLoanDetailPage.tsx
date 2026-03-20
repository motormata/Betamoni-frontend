import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Percent,
  Clock,
  User2,
  UserCog,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import {
  useGetSupervisorLoanByIdQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useDisburseLoanMutation,
} from "@/api/endpoints/supervisorApi";
import { StatusBadge } from "@/features/agent/components/StatusBadge";
import { LoadingState, ErrorState } from "@/features/agent/components/FeedbackStates";

// ── Supervisor Loan Detail Page ────────────────────────────────────

export function SupervisorLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, isError } = useGetSupervisorLoanByIdQuery(id!, { skip: !id });
  const loan = res?.data;

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
          {/* Header Card */}
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
          </div>

          {/* Borrower & Agent Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loan.borrower && (
              <div className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Borrower
                  </span>
                </div>
                <p className="text-sm font-semibold">
                  {loan.borrower.first_name} {loan.borrower.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{loan.borrower.phone}</p>
              </div>
            )}
            {loan.agent && (
              <div className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Agent
                  </span>
                </div>
                <p className="text-sm font-semibold">{loan.agent.name}</p>
                <p className="text-xs text-muted-foreground">{loan.agent.email}</p>
              </div>
            )}
          </div>

          {/* Loan Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailCard icon={Percent} label="Interest Rate" value={`${loan.interest_rate}%`} />
            <DetailCard icon={Calendar} label="Duration" value={`${loan.duration_days} days`} />
            <DetailCard icon={Clock} label="Frequency" value={loan.repayment_frequency} />
            {loan.purpose && (
              <DetailCard icon={Banknote} label="Purpose" value={String(loan.purpose)} />
            )}
            {loan.collection_day && (
              <DetailCard icon={Calendar} label="Collection Day" value={String(loan.collection_day)} />
            )}
            {loan.created_at && (
              <DetailCard
                icon={Calendar}
                label="Created"
                value={new Date(loan.created_at).toLocaleDateString("en-NG", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              />
            )}
          </div>

          {/* ── Action Panel ─────────────────────────────────────── */}
          <LoanActions loanId={loan.id} status={loan.status} />

          {/* Raw JSON */}
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

// ── Loan Actions Panel ─────────────────────────────────────────────

function LoanActions({ loanId, status }: { loanId: string; status: string }) {
  const normalized = status.toLowerCase();
  const isPending = normalized === "pending";
  const isApproved = normalized === "approved";

  // Only show actions for actionable statuses
  if (!isPending && !isApproved) return null;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold">Actions</p>

      <div className="flex flex-col gap-2">
        {isPending && (
          <>
            <ApproveButton loanId={loanId} />
            <RejectForm loanId={loanId} />
          </>
        )}
        {isApproved && (
          <DisburseForm loanId={loanId} />
        )}
      </div>
    </div>
  );
}

// ── Approve Button ─────────────────────────────────────────────────

function ApproveButton({ loanId }: { loanId: string }) {
  const [approveLoan, { isLoading, isError, isSuccess }] = useApproveLoanMutation();

  return (
    <div>
      <button
        type="button"
        onClick={() => approveLoan(loanId)}
        disabled={isLoading || isSuccess}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        <CheckCircle2 className="h-4 w-4" />
        {isLoading ? "Approving…" : isSuccess ? "Approved ✓" : "Approve Loan"}
      </button>
      {isError && (
        <p className="text-xs text-destructive mt-1">Failed to approve. Try again.</p>
      )}
    </div>
  );
}

// ── Reject Form ────────────────────────────────────────────────────

function RejectForm({ loanId }: { loanId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectLoan, { isLoading, isError, isSuccess }] = useRejectLoanMutation();

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim()) {
      await rejectLoan({ id: loanId, rejection_reason: reason.trim() });
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      >
        <XCircle className="h-4 w-4" />
        Reject Loan
      </button>
    );
  }

  return (
    <form onSubmit={handleReject} className="space-y-2 animate-in slide-in-from-top-1 duration-150">
      <textarea
        placeholder="Enter rejection reason…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="input-field h-20 resize-none py-2 text-sm"
        required
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isLoading || isSuccess || !reason.trim()}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Rejecting…" : isSuccess ? "Rejected ✓" : "Confirm Reject"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
      {isError && (
        <p className="text-xs text-destructive">Failed to reject. Try again.</p>
      )}
    </form>
  );
}

// ── Disburse Form ──────────────────────────────────────────────────

function DisburseForm({ loanId }: { loanId: string }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [disburseLoan, { isLoading, isError, isSuccess }] = useDisburseLoanMutation();

  async function handleDisburse(e: React.FormEvent) {
    e.preventDefault();
    if (date) {
      await disburseLoan({ id: loanId, disbursement_date: date });
    }
  }

  return (
    <form onSubmit={handleDisburse} className="space-y-2">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Disbursement Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field mt-1"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        <Send className="h-4 w-4" />
        {isLoading ? "Disbursing…" : isSuccess ? "Disbursed ✓" : "Disburse Loan"}
      </button>
      {isError && (
        <p className="text-xs text-destructive mt-1">Failed to disburse. Try again.</p>
      )}
    </form>
  );
}

// ── Detail Card ────────────────────────────────────────────────────

interface DetailCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function DetailCard({ icon: Icon, label, value }: DetailCardProps) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}
