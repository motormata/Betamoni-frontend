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
  const disbursedCount = summary ? getDisbursedLoanCount(summary) : 0;

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
            tone="primary"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Active"
            value={val(summary.active_loans ?? summary.active)}
            tone="success"
          />
          <SummaryCard
            icon={CreditCard}
            label="Disbursed"
            value={disbursedCount}
            tone="info"
          />
          <SummaryCard
            icon={Clock}
            label="Pending"
            value={val(summary.pending_loans ?? summary.pending)}
            tone="warning"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={val(summary.completed_loans ?? summary.completed)}
            tone="info"
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Defaulted"
            value={val(summary.defaulted_loans ?? summary.defaulted)}
            tone="danger"
          />
          <SummaryCard
            icon={Users2}
            label="Agents"
            value={totalAgents ?? val(summary.total_agents ?? summary.agents)}
            tone="info"
          />
          <SummaryCard
            icon={CreditCard}
            label="Total Disbursed"
            value={formatCurrency(summary.total_disbursed ?? summary.total_principal)}
            tone="primary"
            fullWidth
          />
          <SummaryCard
            icon={CreditCard}
            label="Total Collected"
            value={formatCurrency(summary.total_collected ?? summary.total_repaid)}
            tone="success"
            fullWidth
          />
          <SummaryCard
            icon={CreditCard}
            label="Total Outstanding"
            value={formatCurrency(
              (Number(summary.total_disbursed ?? summary.total_principal) || 0) -
              (Number(summary.total_collected ?? summary.total_repaid) || 0)
            )}
            tone="warning"
            fullWidth
          />
        </div>
      )}
    </div>
  );
}

function getNumericSummaryValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDisbursedLoanCount(summary: Record<string, unknown>): number {
  const explicitDisbursed = summary.disbursed_loans ?? summary.disbursed;
  if (explicitDisbursed != null) {
    return getNumericSummaryValue(explicitDisbursed);
  }

  const total = getNumericSummaryValue(summary.total_loans ?? summary.total);
  const active = getNumericSummaryValue(summary.active_loans ?? summary.active);
  const pending = getNumericSummaryValue(summary.pending_loans ?? summary.pending);
  const completed = getNumericSummaryValue(summary.completed_loans ?? summary.completed);
  const defaulted = getNumericSummaryValue(summary.defaulted_loans ?? summary.defaulted);

  return Math.max(total - active - pending - completed - defaulted, 0);
}
