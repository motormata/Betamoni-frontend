import { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  Banknote,
  Users2,
} from "lucide-react";
import { useGetAgentsPerformanceQuery } from "@/api/endpoints/supervisorApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";
import { fmt } from "@/lib/formatters";
import type { AgentPerformance } from "@/types/supervisor.types";

// ── Helpers ────────────────────────────────────────────────────────

function rateColor(rate: number): string {
  if (rate >= 80) return "text-success";
  if (rate >= 50) return "text-warning";
  return "text-danger";
}

function rateBarColor(rate: number): string {
  if (rate >= 80) return "bg-success";
  if (rate >= 50) return "bg-warning";
  return "bg-danger";
}

// ── Portfolio Section ──────────────────────────────────────────────

function PortfolioSection({ portfolio }: { portfolio: AgentPerformance["portfolio"] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-lg bg-muted/50 lg:bg-card lg:border p-2.5 space-y-1 text-center">
        <Banknote className="h-4 w-4 text-primary mx-auto" />
        <p className="text-sm font-bold text-foreground">{portfolio.active_loans_count}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">Active Loans</p>
      </div>
      <div className="rounded-lg bg-muted/50 lg:bg-card lg:border p-2.5 space-y-1 text-center">
        <AlertTriangle className="mx-auto h-4 w-4 text-danger" />
        <p className="text-sm font-bold text-danger">{portfolio.total_overdue_count}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">Overdue Loans</p>
      </div>
      <div className="rounded-lg bg-muted/50 lg:bg-card lg:border p-2.5 space-y-1 text-center">
        <TrendingUp className="mx-auto h-4 w-4 text-warning" />
        <p className="text-xs font-bold text-warning truncate">{fmt(portfolio.total_overdue_amount)}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">Overdue Amt</p>
      </div>
    </div>
  );
}

// ── Agent Card ─────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: AgentPerformance }) {
  const [expanded, setExpanded] = useState(false);
  const { today, portfolio } = agent;
  const rate = Math.min(today.performance_rate, 100);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">

      {/* ── DESKTOP: full row layout (lg+) ───────────────────── */}
      <div className="hidden lg:flex items-stretch divide-x divide-border/60">

        {/* Col 1: Agent identity + rate */}
        <div className="flex flex-col justify-center gap-2 px-5 py-4 min-w-[200px] w-[220px] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">
                {agent.agent_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-semibold leading-tight truncate">{agent.agent_name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Performance
              </p>
              <span className={`text-sm font-bold ${rateColor(today.performance_rate)}`}>
                {today.performance_rate.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${rateBarColor(today.performance_rate)}`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Col 2: Today's stats */}
        <div className="flex-1 px-5 py-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Today's Collections
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Expected</p>
              <p className="text-base font-bold text-foreground">{fmt(today.expected_amount)}</p>
              <p className="text-[11px] text-muted-foreground">
                {today.expected_count} schedule{today.expected_count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-lg bg-success/10 p-3 space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-success">Collected</p>
              <p className="text-base font-bold text-success">{fmt(today.collected_amount)}</p>
              <p className="text-[11px] text-success/70">
                {today.collected_count} payment{today.collected_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Col 3: Portfolio — always visible on desktop */}
        <div className="w-[340px] shrink-0 px-5 py-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Portfolio
          </p>
          <PortfolioSection portfolio={portfolio} />
        </div>
      </div>

      {/* ── MOBILE: stacked with collapsible portfolio (< lg) ── */}
      <div className="lg:hidden p-4 space-y-3">

        {/* Agent name + toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {agent.agent_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-semibold truncate">{agent.agent_name}</p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            aria-label={expanded ? "Hide portfolio" : "Show portfolio"}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 py-1 px-2 rounded-md hover:bg-muted"
          >
            <span>Portfolio</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Performance rate */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Today's Performance
          </p>
          <span className={`text-sm font-bold ${rateColor(today.performance_rate)}`}>
            {today.performance_rate.toFixed(1)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${rateBarColor(today.performance_rate)}`}
            style={{ width: `${rate}%` }}
          />
        </div>

        {/* Expected vs Collected — always visible on mobile */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Expected</p>
            <p className="text-base font-bold text-foreground">{fmt(today.expected_amount)}</p>
            <p className="text-[11px] text-muted-foreground">
              {today.expected_count} schedule{today.expected_count !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-lg bg-success/10 p-3 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-success">Collected</p>
            <p className="text-base font-bold text-success">{fmt(today.collected_amount)}</p>
            <p className="text-[11px] text-success/70">
              {today.collected_count} payment{today.collected_count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {today.expected_amount === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-1">
            No repayments scheduled for today
          </p>
        )}

        {/* Expandable portfolio on mobile */}
        {expanded && (
          <div className="border-t border-border/60 pt-3 space-y-2 animate-in slide-in-from-top-1 duration-150">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Portfolio Summary
            </p>
            <PortfolioSection portfolio={portfolio} />
          </div>
        )}
      </div>

    </div>
  );
}

// ── Supervisor Agents Page ─────────────────────────────────────────

export function SupervisorAgentsPage() {
  const { data: res, isLoading, isError } = useGetAgentsPerformanceQuery();
  const agents = res?.data ?? [];
  const marketName = res?.market_name;
  const date = res?.date;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={ShieldCheck}
        title="Agents"
        description={
          marketName
            ? `Performance for ${marketName}`
            : "Daily performance for agents under your management"
        }
      />

      {/* Date + count row */}
      {!isLoading && !isError && agents.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users2 className="h-3.5 w-3.5" />
            <span>{agents.length} agent{agents.length !== 1 ? "s" : ""}</span>
          </div>
          {date && (
            <span>
              {new Date(date + "T00:00:00").toLocaleDateString("en-NG", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load agents performance" />}
      {!isLoading && !isError && agents.length === 0 && (
        <EmptyState message="No agents found under your management" />
      )}

      <div className="space-y-3">
        {agents.map((agent) => (
          <AgentCard key={agent.agent_id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
