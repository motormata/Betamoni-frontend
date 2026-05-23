import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState, ErrorState } from "@/components/shared/FeedbackStates";
import { DetailCard } from "@/components/shared/DetailCard";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { formatCurrency } from "@/lib/formatters";
import { hasTrackedSearchParams } from "@/lib/listSearchParams";

export function SupervisorLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: res, isLoading, isError } = useGetSupervisorLoanByIdQuery(id!, {
    skip: !id,
  });
  const loan = res?.data;
  const loanSearchParams = new URLSearchParams(location.search);
  const backTarget = hasTrackedSearchParams(loanSearchParams, [
    "page",
    "status",
    "agent_id",
    "market_id",
    "from_date",
    "to_date",
    "search",
  ])
    ? { pathname: "/loans", search: location.search }
    : "/loans";

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

      {loan && (
        <>
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(loan.principal_amount)}</p>
                  <p className="text-xs text-muted-foreground font-mono">{loan.id}</p>
                </div>
              </div>
              <StatusBadge status={loan.status} />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <DetailCard icon={Percent} label="Interest Rate" value={`${loan.interest_rate}%`} />
            <DetailCard icon={Calendar} label="Duration" value={`${loan.duration_days} days`} />
            <DetailCard icon={Clock} label="Frequency" value={loan.repayment_frequency} />
            {loan.purpose && (
              <DetailCard icon={Banknote} label="Purpose" value={String(loan.purpose)} />
            )}
            {loan.collection_day && (
              <DetailCard
                icon={Calendar}
                label="Collection Day"
                value={String(loan.collection_day)}
              />
            )}
            {loan.created_at && (
              <DetailCard
                icon={Calendar}
                label="Created"
                value={new Date(loan.created_at).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
            )}
          </div>

          <LoanActions loanId={loan.id} status={loan.status} />

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

function LoanActions({ loanId, status }: { loanId: string; status: string }) {
  const normalized = status.toLowerCase();
  const isPending = normalized === "pending";
  const isApproved = normalized === "approved";

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
        {isApproved && <DisburseForm loanId={loanId} />}
      </div>
    </div>
  );
}

function ApproveButton({ loanId }: { loanId: string }) {
  const [approveLoan, { isLoading }] = useApproveLoanMutation();
  const { toast } = useToast();

  async function handleApprove() {
    try {
      await approveLoan(loanId).unwrap();
      toast({
        title: "Loan approved",
        description: "The loan is now ready for disbursement.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: getApiErrorMessage(error, "Failed to approve. Try again."),
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleApprove}
      disabled={isLoading}
      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground hover:bg-success/90 disabled:opacity-50 transition-colors"
    >
      <CheckCircle2 className="h-4 w-4" />
      {isLoading ? "Approving..." : "Approve Loan"}
    </button>
  );
}

function RejectForm({ loanId }: { loanId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectLoan, { isLoading }] = useRejectLoanMutation();
  const { toast } = useToast();

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      await rejectLoan({ id: loanId, rejection_reason: reason.trim() }).unwrap();
      toast({
        title: "Loan rejected",
        description: "The rejection reason was saved successfully.",
      });
      setReason("");
      setExpanded(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Rejection failed",
        description: getApiErrorMessage(error, "Failed to reject. Try again."),
      });
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10 transition-colors"
      >
        <XCircle className="h-4 w-4" />
        Reject Loan
      </button>
    );
  }

  return (
    <form
      onSubmit={handleReject}
      className="space-y-2 animate-in slide-in-from-top-1 duration-150"
    >
      <textarea
        placeholder="Enter rejection reason..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="input-field h-20 resize-none py-2 text-sm"
        required
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isLoading || !reason.trim()}
          className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-danger-foreground hover:bg-danger/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Rejecting..." : "Confirm Reject"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DisburseForm({ loanId }: { loanId: string }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [disburseLoan, { isLoading }] = useDisburseLoanMutation();
  const { toast } = useToast();

  async function handleDisburse(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;

    try {
      await disburseLoan({ id: loanId, disbursement_date: date }).unwrap();
      toast({
        title: "Loan disbursed",
        description: `Disbursement was recorded for ${date}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Disbursement failed",
        description: getApiErrorMessage(error, "Failed to disburse. Try again."),
      });
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
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-info px-4 py-2.5 text-sm font-semibold text-info-foreground hover:bg-info/90 disabled:opacity-50 transition-colors"
      >
        <Send className="h-4 w-4" />
        {isLoading ? "Disbursing..." : "Disburse Loan"}
      </button>
    </form>
  );
}
