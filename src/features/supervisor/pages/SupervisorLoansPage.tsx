import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, ChevronRight, User2, UserCog } from "lucide-react";
import { useGetSupervisorLoansQuery } from "@/api/endpoints/supervisorApi";
import { AgentPageHeader } from "@/features/agent/components/AgentPageHeader";
import { StatusBadge } from "@/features/agent/components/StatusBadge";
import { Pagination } from "@/features/agent/components/Pagination";
import { LoadingState, ErrorState, EmptyState } from "@/features/agent/components/FeedbackStates";

// ── Supervisor Loans Page ──────────────────────────────────────────

export function SupervisorLoansPage() {
  const [page, setPage] = useState(1);
  const { data: res, isLoading, isError } = useGetSupervisorLoansQuery(page);
  const navigate = useNavigate();

  const loans = res?.data?.data ?? [];
  const pagination = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <AgentPageHeader
        icon={Banknote}
        title="Agent Loans"
        description="Review and manage loans created by your agents"
      />

      {/* Loans List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load loans" />}
        {!isLoading && !isError && loans.length === 0 && (
          <EmptyState message="No loans from your agents yet" />
        )}

        {loans.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-border">
            {loans.map((loan) => (
              <li
                key={loan.id}
                onClick={() => navigate(`/loans/${loan.id}`)}
                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">
                      ₦{Number(loan.principal_amount).toLocaleString()}
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
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
