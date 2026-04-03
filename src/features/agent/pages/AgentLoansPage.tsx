import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Plus, ChevronRight } from "lucide-react";
import {
  useGetAgentLoansQuery,
  useGetAgentBorrowersQuery,
  useCreateAgentLoanMutation,
} from "@/api/endpoints/agentApi";

import type { RepaymentFrequency } from "@/types/agent.types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/FeedbackStates";
import { CopyButton } from "@/components/shared/CopyButton";

// ── Agent Loans Page ───────────────────────────────────────────────

export function AgentLoansPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data: res, isLoading, isError } = useGetAgentLoansQuery(page);
  const navigate = useNavigate();

  const loans = res?.data?.data ?? [];
  const pagination = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Banknote}
        title="Loans"
        description="Manage your loan portfolio"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
             Loan
          </button>
        }
      />

      {/* Create Loan Form (expandable) */}
      {showForm && (
        <CreateLoanForm onSuccess={() => setShowForm(false)} />
      )}

      {/* Loans List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load loans" />}
        {!isLoading && !isError && loans.length === 0 && (
          <EmptyState message="No loans yet. Create your first loan above." />
        )}

        {loans.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-border">
            {loans.map((loan) => (
              <li
                key={loan.id}
                onClick={() => navigate(`/loans/${loan.id}`)}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">
                      ₦{Number(loan.principal_amount).toLocaleString()}
                    </p>
                    <StatusBadge status={loan.status} />
                    <CopyButton text={loan.id} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
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

// ── Create Loan Form ───────────────────────────────────────────────

const COLLECTION_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

function CreateLoanForm({ onSuccess }: { onSuccess: () => void }) {
  const [createLoan, { isLoading, isError, error }] = useCreateAgentLoanMutation();
  const { data: borrowersRes, isLoading: borrowersLoading } = useGetAgentBorrowersQuery();
  const borrowers = borrowersRes?.data?.data ?? [];

  const [borrowerId, setBorrowerId] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [repaymentFrequency, setRepaymentFrequency] = useState<RepaymentFrequency | "">("");
  const [collectionDay, setCollectionDay] = useState("");
  const [collectionTime, setCollectionTime] = useState("");
  const [purpose, setPurpose] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrowerId || !repaymentFrequency) return;

    const result = await createLoan({
      borrower_id: borrowerId,
      principal_amount: Number(principalAmount),
      interest_rate: Number(interestRate),
      duration_days: Number(durationDays),
      repayment_frequency: repaymentFrequency as RepaymentFrequency,
      ...(collectionDay && { collection_day: collectionDay }),
      ...(collectionTime && { collection_time: collectionTime }),
      ...(purpose.trim() && { purpose: purpose.trim() }),
    });

    if ("data" in result) {
      onSuccess();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <p className="text-sm font-semibold">Create New Loan</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Borrower *</label>
          <select
            value={borrowerId}
            onChange={(e) => setBorrowerId(e.target.value)}
            className="input-field mt-1"
            required
            disabled={borrowersLoading}
          >
            <option value="">
              {borrowersLoading ? "Loading…" : "Select a borrower"}
            </option>
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.first_name} {b.last_name} — {b.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Principal (₦) *</label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            className="input-field mt-1"
            min="1000"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Interest (%) *</label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="input-field mt-1"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Duration (Days) *</label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="input-field mt-1"
            min="1"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Frequency *</label>
          <select
            value={repaymentFrequency}
            onChange={(e) => setRepaymentFrequency(e.target.value as RepaymentFrequency)}
            className="input-field mt-1"
            required
          >
            <option value="">Select</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Collection Day</label>
          <select
            value={collectionDay}
            onChange={(e) => setCollectionDay(e.target.value)}
            className="input-field mt-1"
          >
            <option value="">None</option>
            {COLLECTION_DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Collection Time</label>
          <input
            type="time"
            value={collectionTime}
            onChange={(e) => setCollectionTime(e.target.value)}
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Purpose</label>
          <input
            type="text"
            placeholder="e.g. Restocking"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="input-field mt-1"
          />
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to create loan"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Creating…" : "Create Loan"}
      </button>
    </form>
  );
}

