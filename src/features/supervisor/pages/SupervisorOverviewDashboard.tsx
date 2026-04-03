import { LayoutDashboard, Banknote, Users2, TrendingUp, Clock, AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";
import { useGetSupervisorLoansSummaryQuery, useGetAgentsPerformanceQuery } from "@/api/endpoints/supervisorApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState, ErrorState } from "@/components/shared/FeedbackStates";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { val, formatCurrency } from "@/lib/formatters";

// ── Supervisor Overview Dashboard ──────────────────────────────────

export function SupervisorOverviewDashboard() {
  const { data: res, isLoading, isError } = useGetSupervisorLoansSummaryQuery();
  const summary = res?.data;

  // Use the agents-performance endpoint to get the true total count
  const { data: agentsRes } = useGetAgentsPerformanceQuery();
  const totalAgents = agentsRes?.data?.length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <PageHeader
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
            value={totalAgents ?? val(summary.total_agents ?? summary.agents)}
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
          <SummaryCard
            icon={CreditCard}
            label="Total Outstanding"
            value={formatCurrency(
              (Number(summary.total_disbursed ?? summary.total_principal) || 0) -
              (Number(summary.total_collected ?? summary.total_repaid) || 0)
            )}
            color="text-orange-500"
            bgColor="bg-orange-500/10"
            fullWidth
          />
        </div>
      )}
    </div>
  );
}
