import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Banknote, ChevronRight, User2, UserCog, Filter, Search, Trash2, Package } from "lucide-react";
import { useGetSupervisorLoansQuery, useGetAgentsPerformanceQuery } from "@/api/endpoints/supervisorApi";
import { useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";
import { useGetSupervisorProductsQuery } from "@/api/endpoints/productsApi";
import type { SupervisorLoansQueryParams } from "@/types/supervisor.types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";
import { formatCurrency } from "@/lib/formatters";
import {
  getSearchParamValue,
  parsePageSearchParam,
  updateSearchParams,
} from "@/lib/listSearchParams";

// ── Loan Status Options ────────────────────────────────────────────

const LOAN_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "disbursed", label: "Disbursed" },
  { value: "completed", label: "Completed" },
  { value: "defaulted", label: "Defaulted" },
];

// ── Supervisor Loans Page ──────────────────────────────────────────

export function SupervisorLoansPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedStatus = getSearchParamValue(searchParams, "status") ?? "";
  const appliedAgentId = getSearchParamValue(searchParams, "agent_id") ?? "";
  const appliedMarketId = getSearchParamValue(searchParams, "market_id") ?? "";
  const appliedFromDate = getSearchParamValue(searchParams, "from_date") ?? "";
  const appliedToDate = getSearchParamValue(searchParams, "to_date") ?? "";
  const appliedSearch = getSearchParamValue(searchParams, "search") ?? "";
  const page = parsePageSearchParam(searchParams.get("page"));

  // ── Filter local state (inputs) ──────────────────────────────
  const [status, setStatus] = useState(appliedStatus);
  const [agentId, setAgentId] = useState(appliedAgentId);
  const [marketId, setMarketId] = useState(appliedMarketId);
  const [fromDate, setFromDate] = useState(appliedFromDate);
  const [toDate, setToDate] = useState(appliedToDate);
  const [search, setSearch] = useState(appliedSearch);
  const [showFilters, setShowFilters] = useState(false);

  // ── Applied filters (sent to API) ────────────────────────────
  useEffect(() => {
    setStatus(appliedStatus);
    setAgentId(appliedAgentId);
    setMarketId(appliedMarketId);
    setFromDate(appliedFromDate);
    setToDate(appliedToDate);
    setSearch(appliedSearch);
  }, [
    appliedAgentId,
    appliedFromDate,
    appliedMarketId,
    appliedSearch,
    appliedStatus,
    appliedToDate,
  ]);

  const filters: SupervisorLoansQueryParams = {
    page,
    ...(appliedStatus && { status: appliedStatus }),
    ...(appliedAgentId && { agent_id: appliedAgentId }),
    ...(appliedMarketId && { market_id: appliedMarketId }),
    ...(appliedFromDate && { from_date: appliedFromDate }),
    ...(appliedToDate && { to_date: appliedToDate }),
    ...(appliedSearch && { search: appliedSearch }),
  };

  // ── Queries ──────────────────────────────────────────────────
  const { data: res, isLoading, isError, isFetching } = useGetSupervisorLoansQuery(filters);
  const { data: agentsRes } = useGetAgentsPerformanceQuery();
  const { data: marketsRes } = useGetClusterMarketsQuery();
  const { data: productsRes } = useGetSupervisorProductsQuery();

  const loans = res?.data?.data ?? [];
  const pagination = res?.data;
  const agents = agentsRes?.data ?? [];
  const markets = marketsRes?.data ?? [];
  const products = productsRes?.data ?? [];
  const activeDeals = products.filter((p) => p.is_active).length;

  // ── Actions ──────────────────────────────────────────────────
  function applyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSearchParams(
      updateSearchParams(searchParams, {
        page: 1,
        status,
        agent_id: agentId,
        market_id: marketId,
        from_date: fromDate,
        to_date: toDate,
        search: search.trim(),
      }),
    );
  }

  function clearFilters() {
    setStatus("");
    setAgentId("");
    setMarketId("");
    setFromDate("");
    setToDate("");
    setSearch("");
    setSearchParams(new URLSearchParams());
  }

  const hasActiveFilters = Boolean(
    filters.status || filters.agent_id || filters.market_id || filters.from_date || filters.to_date || filters.search
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Agent Loans"
        description="Review and manage loans created by your agents"
      />

      {/* Available Deals Banner */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {activeDeals} Active Loan {activeDeals === 1 ? "Deal" : "Deals"}
            </p>
            <p className="text-xs text-muted-foreground">
              {products.map((p) => `${p.name} — ${formatCurrency(p.principal_amount)}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* ── Filters Card ──────────────────────────────────────── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header Toggle */}
        <div
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer md:cursor-default md:pointer-events-none"
        >
          <p className="text-sm font-semibold text-foreground">Filter loans</p>
          <div className="flex items-center gap-3">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-2 pointer-events-auto">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Clear filters"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); applyFilters(); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/20 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>
            {/* Mobile toggle icon */}
            <div className="md:hidden pointer-events-auto flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                  className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="p-1.5 rounded-lg bg-muted text-foreground">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Form Body */}
        <div
          className={`px-4 pb-4 md:block border-t border-border/40 md:border-t-0 space-y-3 md:space-y-0 ${
            showFilters ? "block" : "hidden"
          }`}
        >
          {/* Mobile Apply Button */}
          <div className="md:hidden pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => { applyFilters(); setShowFilters(false); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Apply Filter
            </button>
          </div>

          <form
            onSubmit={applyFilters}
            className="flex flex-col md:flex-row md:items-end gap-3 w-full"
          >
            {/* Search */}
            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <input
                type="text"
                placeholder="Borrower name, loan #…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field mt-1 md:mt-2 text-sm"
              />
            </div>

            {/* Status */}
            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field mt-1 md:mt-2"
              >
                <option value="">All</option>
                {LOAN_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Agent */}
            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="input-field mt-1 md:mt-2"
              >
                <option value="">All agents</option>
                {agents.map((a) => (
                  <option key={a.agent_id} value={a.agent_id}>{a.agent_name}</option>
                ))}
              </select>
            </div>

            {/* Market */}
            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Market</label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="input-field mt-1 md:mt-2"
              >
                <option value="">All markets</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:flex-1">
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input-field mt-1 md:mt-2"
                />
              </div>
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input-field mt-1 md:mt-2"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Loans List ────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load loans" />}
        {!isLoading && !isError && loans.length === 0 && (
          <EmptyState message="No loans match your filters" />
        )}

        {loans.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar relative">
            {isFetching && (
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/20 animate-pulse" />
            )}
            <ul className="divide-y divide-border">
            {loans.map((loan) => (
              <li
                key={loan.id}
                onClick={() =>
                  navigate({
                    pathname: `/loans/${loan.id}`,
                    search: location.search,
                  })
                }
                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">
                      {/* Show product name if available, else fall back to amount */}
                      {(loan as any).product?.name
                        ? (loan as any).product.name
                        : `₦${Number(loan.principal_amount).toLocaleString()}`}
                    </p>
                    <StatusBadge status={loan.status} />
                  </div>

                  {/* Borrower info */}
                  {loan.borrower && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <User2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {loan.borrower.first_name} {loan.borrower.last_name}
                      </span>
                    </div>
                  )}

                  {/* Agent info */}
                  {loan.agent && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <UserCog className="h-3 w-3 shrink-0" />
                      <span className="truncate">{loan.agent.name}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {loan.repayment_frequency} · {loan.duration_days} days · {loan.interest_rate}%
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </li>
            ))}
            </ul>
          </div>
        )}

        {pagination && (
          <div className="px-4 pb-3">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              totalItems={pagination.total}
              fromItem={pagination.from}
              toItem={pagination.to}
              onPageChange={(nextPage) =>
                setSearchParams(updateSearchParams(searchParams, { page: nextPage }))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
