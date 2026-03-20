import { LayoutDashboard, Banknote, Users2, TrendingUp, Clock, AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";
import { useGetSupervisorLoansSummaryQuery } from "@/api/endpoints/supervisorApi";
import { AgentPageHeader } from "@/features/agent/components/AgentPageHeader";
import { LoadingState, ErrorState } from "@/features/agent/components/FeedbackStates";

// ── Supervisor Overview Dashboard ──────────────────────────────────

export function SupervisorOverviewDashboard() {
  const { data: res, isLoading, isError } = useGetSupervisorLoansSummaryQuery();
  const summary = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <AgentPageHeader
        icon={LayoutDashboard}
        title="Supervisor Overview"
        description="Loan portfolio overview for agents under your management"
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load summary" />}

      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Banknote}
            label="Total Loans"
            value={val(summary.total_loans ?? summary.total)}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Active"
            value={val(summary.active_loans ?? summary.active)}
            color="text-emerald-600"
            bgColor="bg-emerald-500/10"
          />
          <SummaryCard
            icon={Clock}
            label="Pending"
            value={val(summary.pending_loans ?? summary.pending)}
            color="text-amber-600"
            bgColor="bg-amber-500/10"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={val(summary.completed_loans ?? summary.completed)}
            color="text-sky-600"
            bgColor="bg-sky-500/10"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Defaulted"
            value={val(summary.defaulted_loans ?? summary.defaulted)}
            color="text-red-500"
            bgColor="bg-red-500/10"
          />
          <SummaryCard
            icon={Users2}
            label="Agents"
            value={val(summary.total_agents ?? summary.agents)}
            color="text-violet-600"
            bgColor="bg-violet-500/10"
          />
          <SummaryCard
            icon={CreditCard}
            label="Total Disbursed"
            value={formatCurrency(summary.total_disbursed ?? summary.total_principal)}
            color="text-primary"
            bgColor="bg-primary/10"
            fullWidth
          />
          <SummaryCard
            icon={CreditCard}
            label="Total Collected"
            value={formatCurrency(summary.total_collected ?? summary.total_repaid)}
            color="text-emerald-600"
            bgColor="bg-emerald-500/10"
            fullWidth
          />
        </div>
      )}
    </div>
  );
}

// ── Summary Card ───────────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  fullWidth?: boolean;
}

function SummaryCard({ icon: Icon, label, value, color, bgColor, fullWidth }: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 flex items-start gap-3 ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <div className={`h-9 w-9 shrink-0 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-lg font-bold ${color} mt-0.5 truncate`}>{value}</p>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

/** Safely cast an unknown summary value to string | number */
function val(v: unknown): string | number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return v;
  return "—";
}

function formatCurrency(value: unknown): string {
  if (value == null) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}
