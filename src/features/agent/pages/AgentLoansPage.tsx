import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Banknote,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  useCreateAgentLoanMutation,
  useGetAgentBorrowersQuery,
  useGetAgentLoansQuery,
  useLazyGetAgentBorrowersQuery,
} from "@/api/endpoints/agentApi";
import { useGetAgentProductsQuery } from "@/api/endpoints/productsApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/FeedbackStates";
import { formatCurrency } from "@/lib/formatters";
import {
  getSearchParamValue,
  parsePageSearchParam,
  updateSearchParams,
} from "@/lib/listSearchParams";
import {
  getAgentLoanDailyActivityStatus,
  isRepayableAgentLoanStatus,
  readAgentLoanDailyActivity,
  type AgentLoanDailyActivity,
  type AgentLoanDailyActivityStatus,
} from "@/lib/agentLoanDailyActivity";
import { useAppSelector } from "@/store/hooks";
import type {
  AgentLoan,
  AgentLoansQueryParams,
  Borrower,
} from "@/types/agent.types";
import type { LoanProduct } from "@/types/product.types";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

const LOAN_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "disbursed", label: "Disbursed" },
  { value: "completed", label: "Completed" },
  { value: "defaulted", label: "Defaulted" },
];

const STICKY_DATE_CHIP_TOP_OFFSET = 40;

interface LoanDisplayDateMeta {
  key: string;
  badgeLabel: string;
  stickyLabel: string;
}

interface GroupedLoanItem {
  loan: AgentLoan;
  displayDate: LoanDisplayDateMeta;
}

interface LoanDateGroup {
  key: string;
  label: string;
  items: GroupedLoanItem[];
}

function getBorrowerFullName(borrower: Pick<Borrower, "full_name" | "first_name" | "last_name">): string {
  return borrower.full_name?.trim() || `${borrower.first_name} ${borrower.last_name}`.trim();
}

function mergeBorrowers(borrowers: Borrower[]): Borrower[] {
  const seenBorrowerIds = new Set<string>();
  const merged: Borrower[] = [];

  borrowers.forEach((borrower) => {
    const borrowerId = String(borrower.id);
    if (seenBorrowerIds.has(borrowerId)) {
      return;
    }

    seenBorrowerIds.add(borrowerId);
    merged.push(borrower);
  });

  return merged;
}

function useAllAgentBorrowers() {
  const { data: borrowersRes, isLoading: initialLoading } = useGetAgentBorrowersQuery(1);
  const [fetchBorrowersPage] = useLazyGetAgentBorrowersQuery();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isLoadingAllPages, setIsLoadingAllPages] = useState(false);

  useEffect(() => {
    const firstPage = borrowersRes?.data;
    if (!firstPage) {
      setBorrowers([]);
      setIsLoadingAllPages(false);
      return;
    }

    const firstPageBorrowers = firstPage.data ?? [];
    const currentPage = firstPage.current_page ?? 1;
    const lastPage = firstPage.last_page ?? 1;
    let isCancelled = false;

    setBorrowers(mergeBorrowers(firstPageBorrowers));

    if (lastPage <= currentPage) {
      setIsLoadingAllPages(false);
      return;
    }

    setIsLoadingAllPages(true);

    void (async () => {
      const mergedPages = [...firstPageBorrowers];

      for (let nextPage = currentPage + 1; nextPage <= lastPage; nextPage += 1) {
        try {
          const response = await fetchBorrowersPage(nextPage).unwrap();
          if (isCancelled) return;

          mergedPages.push(...(response.data?.data ?? []));
        } catch {
          if (!isCancelled) {
            setIsLoadingAllPages(false);
          }
          return;
        }
      }

      if (!isCancelled) {
        setBorrowers(mergeBorrowers(mergedPages));
        setIsLoadingAllPages(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [borrowersRes, fetchBorrowersPage]);

  return {
    borrowers,
    isLoading: initialLoading || isLoadingAllPages,
  };
}

export function AgentLoansPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const groupSentinelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const agentId = useAppSelector((state) => state.auth.user?.id);
  const appliedStatus = getSearchParamValue(searchParams, "status") ?? "";
  const appliedBorrowerId = getSearchParamValue(searchParams, "borrower_id") ?? "";
  const appliedFromDate = getSearchParamValue(searchParams, "from_date") ?? "";
  const appliedToDate = getSearchParamValue(searchParams, "to_date") ?? "";
  const appliedSearch = getSearchParamValue(searchParams, "search") ?? "";
  const page = parsePageSearchParam(searchParams.get("page"));

  const [status, setStatus] = useState(appliedStatus);
  const [borrowerId, setBorrowerId] = useState(appliedBorrowerId);
  const [fromDate, setFromDate] = useState(appliedFromDate);
  const [toDate, setToDate] = useState(appliedToDate);
  const [search, setSearch] = useState(appliedSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [activeStickyDateLabel, setActiveStickyDateLabel] = useState<string | null>(null);

  useEffect(() => {
    setStatus(appliedStatus);
    setBorrowerId(appliedBorrowerId);
    setFromDate(appliedFromDate);
    setToDate(appliedToDate);
    setSearch(appliedSearch);
  }, [appliedBorrowerId, appliedFromDate, appliedSearch, appliedStatus, appliedToDate]);

  const filters: AgentLoansQueryParams = {
    page,
    ...(appliedStatus && { status: appliedStatus }),
    ...(appliedBorrowerId && { borrower_id: appliedBorrowerId }),
    ...(appliedFromDate && { from_date: appliedFromDate }),
    ...(appliedToDate && { to_date: appliedToDate }),
    ...(appliedSearch && { search: appliedSearch }),
  };

  const { data: res, isLoading, isError, isFetching } = useGetAgentLoansQuery(filters);
  const { borrowers, isLoading: borrowersLoading } = useAllAgentBorrowers();

  const loans = res?.data?.data ?? [];
  const pagination = res?.data;
  const dailyActivity = useMemo(
    () => readAgentLoanDailyActivity(agentId),
    [agentId, loans],
  );
  const groupedLoans = useMemo(() => {
    const groups: LoanDateGroup[] = [];

    loans.forEach((loan) => {
      const displayDate = getLoanDisplayDateMeta(loan);
      const previousGroup = groups[groups.length - 1];

      if (previousGroup?.key === displayDate.key) {
        previousGroup.items.push({ loan, displayDate });
        return;
      }

      groups.push({
        key: displayDate.key,
        label: displayDate.stickyLabel,
        items: [{ loan, displayDate }],
      });
    });

    return groups;
  }, [loans]);

  useEffect(() => {
    groupSentinelRefs.current = groupSentinelRefs.current.slice(0, groupedLoans.length);
  }, [groupedLoans.length]);

  useEffect(() => {
    if (groupedLoans.length === 0) {
      setActiveStickyDateLabel(null);
      return;
    }

    const root = scrollContainerRef.current;
    const sentinels = groupSentinelRefs.current.slice(0, groupedLoans.length);

    if (!root || sentinels.some((sentinel) => sentinel == null)) {
      setActiveStickyDateLabel(groupedLoans[0]?.label ?? null);
      return;
    }

    const updateActiveStickyDate = () => {
      const rootTop = root.getBoundingClientRect().top;
      const threshold = rootTop + STICKY_DATE_CHIP_TOP_OFFSET;
      let nextGroupIndex = 0;

      sentinels.forEach((sentinel, index) => {
        if (!sentinel) return;

        if (sentinel.getBoundingClientRect().top <= threshold) {
          nextGroupIndex = index;
        }
      });

      setActiveStickyDateLabel(groupedLoans[nextGroupIndex]?.label ?? groupedLoans[0]?.label ?? null);
    };

    setActiveStickyDateLabel(groupedLoans[0]?.label ?? null);

    const observer = new IntersectionObserver(
      () => {
        updateActiveStickyDate();
      },
      {
        root,
        threshold: 0,
        rootMargin: `-${STICKY_DATE_CHIP_TOP_OFFSET}px 0px -${Math.max(
          root.clientHeight - STICKY_DATE_CHIP_TOP_OFFSET - 1,
          0,
        )}px 0px`,
      },
    );

    sentinels.forEach((sentinel) => {
      if (sentinel) {
        observer.observe(sentinel);
      }
    });

    const frameId = window.requestAnimationFrame(updateActiveStickyDate);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [groupedLoans]);

  function applyFilters(event?: React.FormEvent) {
    if (event) event.preventDefault();

    setSearchParams(
      updateSearchParams(searchParams, {
        page: 1,
        status,
        borrower_id: borrowerId,
        from_date: fromDate,
        to_date: toDate,
        search: search.trim(),
      }),
    );
  }

  function clearFilters() {
    setStatus("");
    setBorrowerId("");
    setFromDate("");
    setToDate("");
    setSearch("");
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(nextPage: number) {
    setSearchParams(updateSearchParams(searchParams, { page: nextPage }));
  }

  const hasActiveFilters = Boolean(
    filters.status ||
      filters.borrower_id ||
      filters.from_date ||
      filters.to_date ||
      filters.search,
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Loans"
        description="Manage your loan portfolio"
        action={
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Loan
          </button>
        }
      />

      {showForm && <CreateLoanForm onSuccess={() => setShowForm(false)} />}

      <div className="rounded-xl border bg-card overflow-hidden">
        <div
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer md:cursor-default md:pointer-events-none"
        >
          <p className="text-sm font-semibold text-foreground">Filter loans</p>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 pointer-events-auto">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    clearFilters();
                  }}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Clear filters"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  applyFilters();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/10 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground/20"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </div>

            <div className="md:hidden pointer-events-auto flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    clearFilters();
                  }}
                  className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="rounded-lg bg-muted p-1.5 text-foreground">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`px-4 pb-4 md:block border-t border-border/40 md:border-t-0 space-y-3 md:space-y-0 ${
            showFilters ? "block" : "hidden"
          }`}
        >
          <div className="md:hidden pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                applyFilters();
                setShowFilters(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-3.5 w-3.5" />
              Apply Filter
            </button>
          </div>

          <form
            onSubmit={applyFilters}
            className="flex flex-col md:flex-row md:items-end gap-3 w-full"
          >
            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <input
                type="text"
                placeholder="Borrower name, loan #..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-field mt-1 md:mt-2 text-sm"
              />
            </div>

            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="input-field mt-1 md:mt-2"
              >
                <option value="">All</option>
                {LOAN_STATUSES.map((loanStatus) => (
                  <option key={loanStatus.value} value={loanStatus.value}>
                    {loanStatus.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:flex-1">
              <label className="text-xs font-medium text-muted-foreground">Borrower</label>
              <select
                value={borrowerId}
                onChange={(event) => setBorrowerId(event.target.value)}
                className="input-field mt-1 md:mt-2"
                disabled={borrowersLoading}
              >
                <option value="">
                  {borrowersLoading ? "Loading borrowers..." : "All borrowers"}
                </option>
                {borrowers.map((borrower) => (
                  <option key={borrower.id} value={borrower.id}>
                    {getBorrowerFullName(borrower)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:flex-1">
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="input-field mt-1 md:mt-2"
                />
              </div>
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="input-field mt-1 md:mt-2"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load loans" />}
        {!isLoading && !isError && loans.length === 0 && (
          <EmptyState
            message={
              hasActiveFilters
                ? "No loans match your filters"
                : "No loans yet. Create your first loan above."
            }
          />
        )}

        {loans.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="custom-scrollbar max-h-[60vh] overflow-y-auto relative"
          >
            {isFetching && (
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/20 animate-pulse" />
            )}
            <SealLegend />
            {activeStickyDateLabel && (
              <div className="pointer-events-none sticky top-0 z-20 px-4 py-2 bg-gradient-to-b from-card via-card/95 to-transparent backdrop-blur supports-[backdrop-filter]:bg-card/75">
                <div className="inline-flex rounded-full border border-border/70 bg-card/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                  {activeStickyDateLabel}
                </div>
              </div>
            )}
            <ul className="divide-y divide-border">
              {groupedLoans.map((group, groupIndex) =>
                group.items.map(({ loan, displayDate }, loanIndex) => {
                  const sealGradient = getLoanSealGradient(dailyActivity, loan);
                  return (
                    <li
                      key={loan.id}
                      onClick={() =>
                        navigate({
                          pathname: `/loans/${loan.id}`,
                          search: location.search,
                        })
                      }
                      className="relative flex cursor-pointer items-center gap-3 px-4 py-3 transition-all hover:brightness-95"
                      style={sealGradient}
                    >
                      {loanIndex === 0 && (
                        <span
                          ref={(node) => {
                            groupSentinelRefs.current[groupIndex] = node;
                          }}
                          className="absolute inset-x-0 top-0 h-px"
                          aria-hidden="true"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <p className="truncate text-sm font-bold">
                            {getLoanTitle(loan)}
                          </p>
                          <span className="text-sm font-normal text-muted-foreground/60">-</span>
                          <p className="truncate text-sm font-bold text-foreground/85">
                            {getLoanBorrowerLabel(loan)}
                          </p>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{loan.repayment_frequency}</span>
                          <span>{loan.duration_days}d</span>
                          <span>{getLoanTimelineLabel(loan, displayDate.badgeLabel)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <StatusBadge status={loan.status} />
                        <LoanDueBadge loan={loan} />
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </li>
                  );
                }),
              )}
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
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getLoanTitle(loan: AgentLoan): string {
  return (loan as AgentLoan & { product?: { name?: string } }).product?.name
    ? (loan as AgentLoan & { product?: { name?: string } }).product?.name ?? ""
    : formatCurrency(loan.principal_amount);
}

function getLoanBorrowerLabel(loan: AgentLoan): string {
  return (
    loan.borrower?.full_name ??
    (loan.borrower ? `${loan.borrower.first_name} ${loan.borrower.last_name}` : null) ??
    "Borrower details unavailable"
  );
}

function getNormalizedLoanStatus(loan: AgentLoan): string {
  return String(loan.status ?? "").toLowerCase().trim();
}

function isLoanDisbursedForDisplay(loan: AgentLoan): boolean {
  const normalizedStatus = getNormalizedLoanStatus(loan);

  if (normalizedStatus === "rejected") {
    return false;
  }

  return Boolean(loan.disbursement_date || loan.disbursed_at);
}

function resolveLoanDisplayDateValue(loan: AgentLoan): string | null | undefined {
  if (isLoanDisbursedForDisplay(loan)) {
    return loan.disbursement_date ?? loan.disbursed_at ?? loan.created_at;
  }

  return loan.created_at ?? loan.disbursement_date ?? loan.disbursed_at;
}

function parseLoanDisplayDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

function getLoanDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatLoanDateBadge(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStickyLoanDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLoanDisplayDateMeta(loan: AgentLoan): LoanDisplayDateMeta {
  const resolvedDate = parseLoanDisplayDate(resolveLoanDisplayDateValue(loan));

  if (!resolvedDate) {
    return {
      key: "unknown-date",
      badgeLabel: "Unknown date",
      stickyLabel: "Unknown date",
    };
  }

  return {
    key: getLoanDateKey(resolvedDate),
    badgeLabel: formatLoanDateBadge(resolvedDate),
    stickyLabel: formatStickyLoanDate(resolvedDate),
  };
}

function getLoanTimelineLabel(loan: AgentLoan, primaryDateLabel: string): string {
  if (!isLoanDisbursedForDisplay(loan)) {
    return `Created ${primaryDateLabel}`;
  }

  if (loan.due_date) {
    return `Tenure ${formatLoanRangeStartLabel(resolveLoanDisplayDateValue(loan))} - ${formatLoanRangeEndLabel(loan.due_date)}`;
  }

  return `Disbursed ${primaryDateLabel}`;
}

function formatLoanRangeStartLabel(value: string | null | undefined): string {
  const parsedDate = parseLoanDisplayDate(value);
  if (!parsedDate) return value ?? "Unknown";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatLoanRangeEndLabel(value: string): string {
  const parsedDate = parseLoanDisplayDate(value);
  if (!parsedDate) return value;

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtShortDate(value: string): string {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function LoanDueBadge({ loan }: { loan: AgentLoan }) {
  const normalizedStatus = loan.status.toLowerCase().trim();
  if (normalizedStatus === "completed" || normalizedStatus === "defaulted") {
    return null;
  }

  if (!loan.due_date) return null;

  const dueDate = loan.due_date.includes("T")
    ? new Date(loan.due_date)
    : new Date(`${loan.due_date}T00:00:00`);
  if (Number.isNaN(dueDate.getTime())) return null;

  const today = new Date();
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  if (due === current) {
    return (
      <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning ring-1 ring-inset ring-warning/20">
        Due today
      </span>
    );
  }

  if (due < current && normalizedStatus !== "overdue") {
    return (
      <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-danger ring-1 ring-inset ring-danger/20">
        Past due
      </span>
    );
  }

  return null;
}

const SEAL_GRADIENTS: Record<
  AgentLoanDailyActivityStatus,
  { background: string; title: string }
> = {
  unopened: {
    background: "linear-gradient(90deg, hsl(38 92% 50% / 0.22) 0%, transparent 55%)",
    title: "Loan has not been opened today",
  },
  opened: {
    background: "linear-gradient(90deg, hsl(210 100% 56% / 0.20) 0%, transparent 55%)",
    title: "Loan has been opened today",
  },
  paid: {
    background: "linear-gradient(90deg, hsl(142 71% 45% / 0.22) 0%, transparent 55%)",
    title: "Payment has been recorded today",
  },
};

function getLoanSealGradient(
  activity: AgentLoanDailyActivity,
  loan: AgentLoan,
): React.CSSProperties | undefined {
  if (!isRepayableAgentLoanStatus(loan.status)) return undefined;
  const status = getAgentLoanDailyActivityStatus(activity, loan.id);
  return { background: SEAL_GRADIENTS[status].background };
}

function SealLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/30 px-4 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Today's Activity:
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "linear-gradient(90deg, hsl(38 92% 50% / 0.35), hsl(38 92% 50% / 0.08))" }}
        />
        <span className="text-[11px] text-muted-foreground">Unopened</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "linear-gradient(90deg, hsl(210 100% 56% / 0.35), hsl(210 100% 56% / 0.08))" }}
        />
        <span className="text-[11px] text-muted-foreground">Opened</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-6 rounded-sm"
          style={{ background: "linear-gradient(90deg, hsl(142 71% 45% / 0.40), hsl(142 71% 45% / 0.10))" }}
        />
        <span className="text-[11px] text-muted-foreground">Paid</span>
      </div>
    </div>
  );
}

function BorrowerSelect({
  borrowers,
  value,
  onChange,
  isLoading,
}: {
  borrowers: Borrower[];
  value: string;
  onChange: (id: string) => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return borrowers;
    const lower = search.toLowerCase();
    return borrowers.filter(
      (b) =>
        b.first_name.toLowerCase().includes(lower) ||
        b.last_name.toLowerCase().includes(lower) ||
        b.phone.includes(lower)
    );
  }, [borrowers, search]);

  const selectedBorrower = useMemo(
    () => borrowers.find((b) => b.id === value),
    [borrowers, value]
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="input-field mt-1 flex items-center justify-between cursor-pointer bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!selectedBorrower ? "text-muted-foreground" : "truncate"}>
          {isLoading
            ? "Loading..."
            : selectedBorrower
            ? `${selectedBorrower.first_name} ${selectedBorrower.last_name} - ${selectedBorrower.phone}`
            : "Select a borrower"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md flex flex-col animate-in fade-in-80">
          <div className="sticky top-0 z-20 bg-popover p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="p-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No borrowers found.
              </div>
            ) : (
              filtered.map((borrower) => (
                <div
                  key={borrower.id}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                    value === borrower.id ? "bg-accent text-accent-foreground font-medium" : ""
                  }`}
                  onClick={() => {
                    onChange(borrower.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {value === borrower.id && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {borrower.first_name} {borrower.last_name} - {borrower.phone}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateLoanForm({ onSuccess }: { onSuccess: () => void }) {
  const [createLoan, { isLoading, isError, error }] = useCreateAgentLoanMutation();
  const { borrowers, isLoading: borrowersLoading } = useAllAgentBorrowers();
  const { data: productsRes, isLoading: productsLoading } = useGetAgentProductsQuery();
  const { toast } = useToast();
  const products = productsRes?.data ?? [];
  const activeProducts = products.filter((product) => product.is_active);

  const [borrowerId, setBorrowerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const selectedProduct = activeProducts.find((product) => product.id === productId) as
    | LoanProduct
    | undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!borrowerId || !productId) return;

    try {
      await createLoan({
        borrower_id: borrowerId,
        loan_product_id: productId,
        quantity: Number(quantity),
      }).unwrap();

      toast({
        title: "Loan created",
        description: `${selectedProduct?.name ?? "Loan"} has been issued successfully.`,
      });
      setBorrowerId("");
      setProductId("");
      setQuantity("1");
      onSuccess();
    } catch {
      // Inline error text keeps the fix in context.
    }
  }

  const freqLabel: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-Weekly",
    monthly: "Monthly",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in slide-in-from-top-2 rounded-xl border bg-card p-4 space-y-4 duration-200"
    >
      <p className="text-sm font-semibold">Issue Loan</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Borrower *</label>
          <BorrowerSelect
            borrowers={borrowers}
            value={borrowerId}
            onChange={setBorrowerId}
            isLoading={borrowersLoading}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Loan Deal *</label>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="input-field mt-1"
            required
            disabled={productsLoading}
          >
            <option value="">{productsLoading ? "Loading..." : "Select a deal"}</option>
            {activeProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatCurrency(product.principal_amount)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>
      </div>

      {selectedProduct && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deal Preview
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{formatCurrency(selectedProduct.expected_amount_to_pay)} expected</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{selectedProduct.duration_days} days</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {freqLabel[selectedProduct.repayment_frequency]} repayment -{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(selectedProduct.expected_amount_to_pay * Number(quantity || 1))} expected total
            </span>
          </p>
        </div>
      )}

      {isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(error, "Failed to create loan")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !borrowerId || !productId}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Creating..." : "Issue Loan"}
      </button>
    </form>
  );
}
