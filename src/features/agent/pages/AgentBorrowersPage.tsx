import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users2, Plus, ChevronRight, Phone } from "lucide-react";
import {
  useGetAgentBorrowersQuery,
  useCreateBorrowerMutation,
} from "@/api/endpoints/agentApi";
import { useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";
import type { Gender } from "@/types/agent.types";
import { AgentPageHeader } from "../components/AgentPageHeader";
import { Pagination } from "../components/Pagination";
import { LoadingState, ErrorState, EmptyState } from "../components/FeedbackStates";

// ── Agent Borrowers Page ───────────────────────────────────────────

export function AgentBorrowersPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data: res, isLoading, isError } = useGetAgentBorrowersQuery(page);
  const navigate = useNavigate();

  const borrowers = res?.data?.data ?? [];
  const pagination = res?.data;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <AgentPageHeader
        icon={Users2}
        title="Borrowers"
        description="Manage your registered borrowers"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Borrower
          </button>
        }
      />

      {/* Create Borrower Form (expandable) */}
      {showForm && (
        <CreateBorrowerForm onSuccess={() => setShowForm(false)} />
      )}

      {/* Borrowers List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Failed to load borrowers" />}
        {!isLoading && !isError && borrowers.length === 0 && (
          <EmptyState message="No borrowers yet. Register your first borrower above." />
        )}

        {borrowers.length > 0 && (
          <ul className="divide-y divide-border">
            {borrowers.map((b) => (
              <li
                key={b.id}
                onClick={() => navigate(`/borrowers/${b.id}`)}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    {b.first_name} {b.last_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" />
                    <span>{b.phone}</span>
                    <span className="text-border">·</span>
                    <span className="capitalize">{b.gender}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}

        {pagination && (
          <div className="px-4 pb-3">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Borrower Form ───────────────────────────────────────────

function CreateBorrowerForm({ onSuccess }: { onSuccess: () => void }) {
  const [createBorrower, { isLoading, isError, error }] = useCreateBorrowerMutation();
  const { data: marketsRes, isLoading: marketsLoading } = useGetClusterMarketsQuery();
  const markets = marketsRes?.data ?? [];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [marketId, setMarketId] = useState("");
  const [gender, setGender] = useState<Gender | "">("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender || !marketId) return;

    const result = await createBorrower({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      home_address: homeAddress.trim(),
      market_id: marketId,
      gender: gender as Gender,
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
      <p className="text-sm font-semibold">Register New Borrower</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">First Name *</label>
          <input
            type="text"
            placeholder="e.g. Amaka"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Last Name *</label>
          <input
            type="text"
            placeholder="e.g. Okafor"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Phone *</label>
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Gender *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="input-field mt-1"
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Home Address *</label>
          <input
            type="text"
            placeholder="e.g. 12 Balogun Street, Lagos"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
            className="input-field mt-1"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Market *</label>
          <select
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            className="input-field mt-1"
            required
            disabled={marketsLoading}
          >
            <option value="">
              {marketsLoading ? "Loading markets…" : "Select a market"}
            </option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError && (
        <p className="text-xs text-destructive">
          {(error as any)?.data?.message ?? "Failed to register borrower"}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Registering…" : "Register Borrower"}
      </button>
    </form>
  );
}
