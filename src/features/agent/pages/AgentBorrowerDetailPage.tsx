import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User2, Phone, MapPin, Calendar, Building2 } from "lucide-react";
import { useGetAgentBorrowerByIdQuery } from "@/api/endpoints/agentApi";
import { LoadingState, ErrorState } from "../components/FeedbackStates";

// ── Agent Borrower Detail Page ─────────────────────────────────────

export function AgentBorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, isError } = useGetAgentBorrowerByIdQuery(id!, { skip: !id });
  const borrower = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/borrowers")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Borrowers
      </button>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load borrower" />}

      {borrower && (
        <>
          {/* Profile Header */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User2 className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold truncate">
                  {borrower.first_name} {borrower.last_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">{borrower.id}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={Phone} label="Phone" value={borrower.phone} />
            <InfoCard icon={User2} label="Gender" value={borrower.gender} capitalize />
            <InfoCard icon={MapPin} label="Address" value={borrower.home_address} fullWidth />
            {borrower.market && typeof borrower.market === "object" && (
              <InfoCard
                icon={Building2}
                label="Market"
                value={(borrower.market as { name: string }).name}
              />
            )}
            {borrower.created_at && (
              <InfoCard
                icon={Calendar}
                label="Registered"
                value={new Date(borrower.created_at).toLocaleDateString("en-NG", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              />
            )}
          </div>

          {/* Registered By */}
          {borrower.registered_by && typeof borrower.registered_by === "object" && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Registered By
              </p>
              <p className="text-sm font-semibold">
                {(borrower.registered_by as { name: string }).name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(borrower.registered_by as { email: string }).email}
              </p>
            </div>
          )}

          {/* Raw JSON */}
          <details className="rounded-xl border bg-card">
            <summary className="px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Raw Response
            </summary>
            <pre className="px-4 pb-4 text-xs overflow-auto max-h-60 text-muted-foreground">
              {JSON.stringify(borrower, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

// ── Info Card ──────────────────────────────────────────────────────

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  capitalize?: boolean;
  fullWidth?: boolean;
}

function InfoCard({ icon: Icon, label, value, capitalize, fullWidth }: InfoCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-3 ${fullWidth ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-sm font-semibold truncate ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}
