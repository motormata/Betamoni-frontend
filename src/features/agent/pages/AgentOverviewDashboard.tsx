import {
  LayoutDashboard, Banknote, Users2, CreditCard, TrendingUp, Clock,
  AlertTriangle, CheckCircle2, Target, CalendarCheck, CircleDot, Zap,
} from "lucide-react";
import {
  useGetAgentLoansSummaryQuery,
  useGetAgentBorrowersQuery,
  useGetTodayRepaymentsQuery,
} from "@/api/endpoints/agentApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState, ErrorState } from "@/components/shared/FeedbackStates";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { val, formatCurrency } from "@/lib/formatters";
import type { TodayRepaymentsData } from "@/api/endpoints/agentApi";

// ── Agent Overview Dashboard ───────────────────────────────────────

export function AgentOverviewDashboard() {
  const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: res, isLoading, isError } = useGetAgentLoansSummaryQuery();
  const { data: todayRes, isLoading: todayLoading } = useGetTodayRepaymentsQuery(todayDate);
  const { data: borrowersRes } = useGetAgentBorrowersQuery();

  const summary = res?.data;
  const today = todayRes?.data;
  const totalBorrowers = borrowersRes?.data?.total;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title="Overview"
        description="Your loan portfolio at a glance"
      />

      {/* ── Today's Target ──────────────────────────── */}
      {todayLoading && (
        <div className="rounded-xl border bg-card p-4 animate-pulse h-32" />
      )}
      {today && <TodayTargetCard today={today} />}

      {/* ── Portfolio Summary ───────────────────────── */}
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load summary" />}

      {summary && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide -mb-2">
            Portfolio Summary
          </p>
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
              label="Borrowers"
              value={totalBorrowers ?? val(summary.total_borrowers ?? summary.borrowers)}
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
        </>
      )}
    </div>
  );
}

// ── Today's Target Card ────────────────────────────────────────────

function TodayTargetCard({ today }: { today: TodayRepaymentsData }) {
  const rate = Math.min(today.collection_rate, 100);
  const outstanding = Math.max(today.outstanding, 0); // clamp negatives (overpaid)
  const isComplete = rate >= 100;
  const overpaid = today.outstanding < 0;

  // Progress arc colour
  const progressColor = rate >= 100
    ? "text-emerald-500"
    : rate >= 60
    ? "text-primary"
    : "text-amber-500";

  const fmtDate = new Date(today.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Today's Target</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDate}</p>
          </div>
        </div>
        {isComplete ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <Zap className="h-3 w-3" /> Target met!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <CircleDot className="h-3 w-3" /> In progress
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-1 pb-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Collection rate</span>
          <span className={`font-bold ${progressColor}`}>{rate.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              rate >= 100 ? "bg-emerald-500" : rate >= 60 ? "bg-primary" : "bg-amber-500"
            }`}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 divide-x divide-border border-t">
        <StatTile
          icon={Target}
          label="Expected"
          value={formatCurrency(today.total_expected)}
          color="text-foreground"
        />
        <StatTile
          icon={CheckCircle2}
          label="Collected"
          value={formatCurrency(today.total_collected)}
          color="text-emerald-600"
        />
        <StatTile
          icon={overpaid ? Zap : AlertTriangle}
          label={overpaid ? "Overpaid" : "Remaining"}
          value={formatCurrency(overpaid ? Math.abs(today.outstanding) : outstanding)}
          color={overpaid ? "text-sky-600" : outstanding > 0 ? "text-amber-600" : "text-emerald-600"}
        />
      </div>

      {/* Payments count row */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/20">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarCheck className="h-3.5 w-3.5" />
          <span>
            <span className="font-semibold text-foreground">{today.paid_count}</span> of{" "}
            <span className="font-semibold text-foreground">{today.total_schedules}</span> scheduled
            {today.total_schedules === 1 ? " repayment" : " repayments"} collected
          </span>
        </div>
        {today.pending_count > 0 && (
          <span className="text-[11px] text-amber-600 font-medium">
            {today.pending_count} pending
          </span>
        )}
      </div>
    </div>
  );
}

// ── Stat Tile ──────────────────────────────────────────────────────

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center py-3 px-2 gap-0.5">
      <Icon className={`h-3.5 w-3.5 ${color} mb-0.5`} />
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
