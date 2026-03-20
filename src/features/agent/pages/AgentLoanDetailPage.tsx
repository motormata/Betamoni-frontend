import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Calendar, Percent, Clock, User2 } from "lucide-react";
import { useGetAgentLoanByIdQuery } from "@/api/endpoints/agentApi";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState, ErrorState } from "../components/FeedbackStates";

// ── Agent Loan Detail Page ─────────────────────────────────────────

export function AgentLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, isError } = useGetAgentLoanByIdQuery(id!, { skip: !id });
  const loan = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/loans")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loans
      </button>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load loan details" />}

      {loan && (
        <>
          {/* Header */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    ₦{Number(loan.principal_amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{loan.id}</p>
                </div>
              </div>
              <StatusBadge status={loan.status} />
            </div>
          </div>

          {/* Loan Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailCard icon={Percent} label="Interest Rate" value={`${loan.interest_rate}%`} />
            <DetailCard icon={Calendar} label="Duration" value={`${loan.duration_days} days`} />
            <DetailCard icon={Clock} label="Frequency" value={loan.repayment_frequency} />
            <DetailCard icon={User2} label="Borrower ID" value={loan.borrower_id} mono />
            {loan.collection_day && (
              <DetailCard icon={Calendar} label="Collection Day" value={String(loan.collection_day)} />
            )}
            {loan.collection_time && (
              <DetailCard icon={Clock} label="Collection Time" value={String(loan.collection_time)} />
            )}
            {loan.purpose && (
              <DetailCard icon={Banknote} label="Purpose" value={String(loan.purpose)} fullWidth />
            )}
          </div>

          {/* Timestamps */}
          {loan.created_at && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Created: {new Date(loan.created_at).toLocaleDateString("en-NG", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          )}

          {/* Raw JSON (dev aid) */}
          <details className="rounded-xl border bg-card">
            <summary className="px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Raw Response
            </summary>
            <pre className="px-4 pb-4 text-xs overflow-auto max-h-60 text-muted-foreground">
              {JSON.stringify(loan, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

// ── Detail Card ────────────────────────────────────────────────────

interface DetailCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  fullWidth?: boolean;
}

function DetailCard({ icon: Icon, label, value, mono, fullWidth }: DetailCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-3 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-sm font-semibold truncate ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
