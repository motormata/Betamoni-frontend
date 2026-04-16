import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  User2,
} from "lucide-react";
import { useGetAgentBorrowerByIdQuery } from "@/api/endpoints/agentApi";
import { ErrorState, LoadingState } from "@/components/shared/FeedbackStates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/formatters";
import type { AgentLoan, Borrower } from "@/types/agent.types";

interface BorrowerPerformanceSummary {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalPrincipal: number;
  totalPaid: number;
  totalOutstanding: number;
  repaymentScore: number | null;
  repaymentLabel: string;
}

export function AgentBorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, isError } = useGetAgentBorrowerByIdQuery(id!, { skip: !id });
  const borrower = res?.data;
  const loans = borrower ? getBorrowerLoans(borrower) : [];
  const performance = buildBorrowerPerformance(loans);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <button
        type="button"
        onClick={() => navigate("/borrowers")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Borrowers
      </button>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load borrower" />}

      {borrower && (
        <>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User2 className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">
                  {borrower.first_name} {borrower.last_name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{borrower.id}</p>
              </div>
            </div>
          </div>

          {(() => {
            const market =
              typeof borrower.market === "object" && borrower.market !== null
                ? (borrower.market as { name: string })
                : null;
            const createdAt =
              typeof borrower.created_at === "string" ? borrower.created_at : null;

            return (
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={Phone} label="Phone" value={borrower.phone} />
                <InfoCard icon={User2} label="Gender" value={borrower.gender} capitalize />
                <InfoCard
                  icon={MapPin}
                  label="Address"
                  value={borrower.home_address}
                  fullWidth
                />
                {market && <InfoCard icon={Building2} label="Market" value={market.name} />}
                {createdAt && (
                  <InfoCard
                    icon={Calendar}
                    label="Registered"
                    value={new Date(createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                )}
              </div>
            );
          })()}

          {typeof borrower.registered_by === "object" && borrower.registered_by !== null && (
            <div className="rounded-xl border bg-card p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Registered By
              </p>
              <p className="text-sm font-semibold">
                {(borrower.registered_by as { name: string }).name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(borrower.registered_by as { email: string }).email}
              </p>
            </div>
          )}

          <BorrowerPerformanceCard performance={performance} />

          <BorrowerLoanHistory loans={loans} />

          <details className="rounded-xl border bg-card">
            <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Raw Response
            </summary>
            <pre className="max-h-60 overflow-auto px-4 pb-4 text-xs text-muted-foreground">
              {JSON.stringify(borrower, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

function getBorrowerLoans(borrower: Borrower): AgentLoan[] {
  if (!Array.isArray(borrower.loans)) return [];

  return borrower.loans.filter(
    (loan): loan is AgentLoan =>
      typeof loan === "object" &&
      loan !== null &&
      typeof loan.id === "string" &&
      typeof loan.status === "string",
  );
}

function buildBorrowerPerformance(loans: AgentLoan[]): BorrowerPerformanceSummary {
  const totalLoans = loans.length;
  const completedLoans = loans.filter((loan) => loan.status.toLowerCase() === "completed").length;
  const defaultedLoans = loans.filter((loan) => loan.status.toLowerCase() === "defaulted").length;
  const activeLoans = loans.filter((loan) => {
    const status = loan.status.toLowerCase();
    return status === "active" || status === "disbursed" || status === "approved" || status === "pending";
  }).length;

  const totalPrincipal = loans.reduce((sum, loan) => sum + (Number(loan.principal_amount) || 0), 0);
  const totalPaid = loans.reduce((sum, loan) => sum + (Number(loan.amount_paid) || 0), 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + Math.max(Number(loan.balance) || 0, 0), 0);

  const repaymentScore =
    totalLoans === 0
      ? null
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (((completedLoans * 1 + activeLoans * 0.55) / totalLoans) * 100) -
                ((defaultedLoans / totalLoans) * 35),
            ),
          ),
        );

  const repaymentLabel =
    repaymentScore == null
      ? "No repayment history yet"
      : repaymentScore >= 80
      ? "Strong repayment history"
      : repaymentScore >= 60
      ? "Healthy repayment pattern"
      : repaymentScore >= 40
      ? "Mixed repayment history"
      : "High repayment risk";

  return {
    totalLoans,
    activeLoans,
    completedLoans,
    defaultedLoans,
    totalPrincipal,
    totalPaid,
    totalOutstanding,
    repaymentScore,
    repaymentLabel,
  };
}

function BorrowerPerformanceCard({
  performance,
}: {
  performance: BorrowerPerformanceSummary;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Repayment Health
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Internal score based on known loan outcomes
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {performance.repaymentScore == null ? "—" : `${performance.repaymentScore}`}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Score / 100</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{performance.repaymentLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={TrendingUp} label="Total Loans" value={String(performance.totalLoans)} />
        <MetricCard icon={CheckCircle2} label="Completed" value={String(performance.completedLoans)} />
        <MetricCard icon={ArrowUpRight} label="Active" value={String(performance.activeLoans)} />
        <MetricCard icon={ShieldCheck} label="Defaulted" value={String(performance.defaultedLoans)} />
        <MetricCard
          icon={TrendingUp}
          label="Total Borrowed"
          value={formatCurrency(performance.totalPrincipal)}
          fullWidth
        />
        <MetricCard
          icon={CheckCircle2}
          label="Total Paid"
          value={formatCurrency(performance.totalPaid)}
          fullWidth
        />
        <MetricCard
          icon={ShieldCheck}
          label="Outstanding"
          value={formatCurrency(performance.totalOutstanding)}
          fullWidth
        />
      </div>
    </div>
  );
}

function BorrowerLoanHistory({ loans }: { loans: AgentLoan[] }) {
  if (loans.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Loan History
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Loan performance data is not available in this borrower response yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Loan History
        </p>
        <p className="mt-1 text-sm text-foreground">
          {loans.length} recorded loan{loans.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="custom-scrollbar max-h-[28rem] overflow-y-auto">
        <ul className="divide-y divide-border">
          {loans.map((loan) => (
            <li key={loan.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {loan.loan_number ?? formatCurrency(loan.principal_amount)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {loan.repayment_frequency} · {loan.duration_days}d · {loan.interest_rate}%
                  </p>
                </div>
                <StatusBadge status={loan.status} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <LoanMiniMetric label="Principal" value={formatCurrency(loan.principal_amount)} />
                <LoanMiniMetric label="Paid" value={formatCurrency(loan.amount_paid ?? 0)} />
                <LoanMiniMetric label="Balance" value={formatCurrency(loan.balance ?? 0)} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {loan.created_at && <span>Taken {fmtDate(loan.created_at)}</span>}
                {loan.due_date && <span>Due {fmtDate(loan.due_date)}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  fullWidth,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card p-3 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function LoanMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  capitalize?: boolean;
  fullWidth?: boolean;
}

function InfoCard({ icon: Icon, label, value, capitalize, fullWidth }: InfoCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-3 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={`truncate text-sm font-semibold ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function fmtDate(value: string): string {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
