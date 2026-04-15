import { useState } from "react";
import {
  LayoutDashboard,
  Banknote,
  Users2,
  CreditCard,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Target,
  CalendarCheck,
  CircleDot,
  Zap,
  ChevronDown,
  Phone,
  MapPin,
  Hash,
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
import type {
  TodayRepaymentsData,
  TodayRepaymentPendingItem,
} from "@/api/endpoints/agentApi";

export function AgentOverviewDashboard() {
  const todayDate = new Date().toISOString().slice(0, 10);

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

      {todayLoading && (
        <div className="h-32 animate-pulse rounded-xl border bg-card p-4" />
      )}
      {today && <TodayTargetCard today={today} />}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load summary" />}

      {summary && (
        <>
          <p className="-mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Portfolio Summary
          </p>
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
              label="Borrowers"
              value={totalBorrowers ?? val(summary.total_borrowers ?? summary.borrowers)}
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
                  (Number(summary.total_collected ?? summary.total_repaid) || 0),
              )}
              tone="warning"
              fullWidth
            />
          </div>
        </>
      )}
    </div>
  );
}

function TodayTargetCard({ today }: { today: TodayRepaymentsData }) {
  const [showPendingList, setShowPendingList] = useState(false);
  const rate = Math.min(today.collection_rate, 100);
  const outstanding = Math.max(today.outstanding, 0);
  const isComplete = rate >= 100;
  const overpaid = today.outstanding < 0;
  const pendingItems = today.pending_list ?? [];

  const progressColor =
    rate >= 100 ? "text-success" : rate >= 60 ? "text-primary" : "text-warning";

  const fmtDate = new Date(today.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col lg:grid lg:grid-cols-2">
        <div className="min-w-0">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Today's Target</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtDate}</p>
              </div>
            </div>
            {isComplete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                <Zap className="h-3 w-3" /> Target met!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                <CircleDot className="h-3 w-3" /> In progress
              </span>
            )}
          </div>

          <div className="space-y-1 px-4 pt-1 pb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Collection rate</span>
              <span className={`font-bold ${progressColor}`}>{rate.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  rate >= 100 ? "bg-success" : rate >= 60 ? "bg-primary" : "bg-warning"
                }`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>

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
              color="text-success"
            />
            <StatTile
              icon={overpaid ? Zap : AlertTriangle}
              label={overpaid ? "Overpaid" : "Remaining"}
              value={formatCurrency(overpaid ? Math.abs(today.outstanding) : outstanding)}
              color={overpaid ? "text-info" : outstanding > 0 ? "text-warning" : "text-success"}
            />
          </div>

          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>
                <span className="font-semibold text-foreground">{today.paid_count}</span> of{" "}
                <span className="font-semibold text-foreground">{today.total_schedules}</span>{" "}
                scheduled{today.total_schedules === 1 ? " repayment" : " repayments"} collected
              </span>
            </div>
            {today.pending_count > 0 && (
              <span className="text-[11px] font-medium text-warning">
                {today.pending_count} pending
              </span>
            )}
          </div>

          <div className="border-t px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setShowPendingList((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted/70"
              aria-expanded={showPendingList}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pending Breakdown
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {pendingItems.length > 0
                    ? `${pendingItems.length} borrower${pendingItems.length === 1 ? "" : "s"} due today`
                    : "No pending repayments"}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  showPendingList ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div
          className={`border-t lg:block lg:border-t-0 lg:border-l ${
            showPendingList ? "block" : "hidden"
          }`}
        >
          <PendingBreakdownPanel pendingItems={pendingItems} />
        </div>
      </div>
    </div>
  );
}

function PendingBreakdownPanel({
  pendingItems,
}: {
  pendingItems: TodayRepaymentPendingItem[];
}) {
  return (
    <div className="h-full px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pending Breakdown
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            Individual repayments due today
          </p>
        </div>
        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
          {pendingItems.length} pending
        </span>
      </div>

      {pendingItems.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          No pending repayments for today.
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="flex gap-3">
            {pendingItems.map((item) => (
              <PendingRepaymentCard key={item.schedule_id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PendingRepaymentCard({
  item,
}: {
  item: TodayRepaymentPendingItem;
}) {
  return (
    <article className="min-w-[16.5rem] flex-1 rounded-xl border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.borrower_name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.borrower_phone}</span>
          </div>
        </div>
        <div className="rounded-lg bg-warning/10 px-2 py-1 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-warning">
            Remaining
          </p>
          <p className="text-sm font-bold text-warning">{formatCurrency(item.remaining)}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Hash className="h-3 w-3 shrink-0" />
          <span className="font-medium text-foreground">{item.loan_number}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-background/70 px-2.5 py-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Expected
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(item.expected_amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Paid
            </p>
            <p className="text-sm font-semibold text-success">
              {formatCurrency(item.amount_paid)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {item.location?.trim() ? item.location : "No location recorded"}
          </span>
        </div>
      </div>
    </article>
  );
}

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
    <div className="flex flex-col items-center gap-0.5 px-2 py-3">
      <Icon className={`mb-0.5 h-3.5 w-3.5 ${color}`} />
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
