import { useState } from "react";
import { UserCircle2, PlusCircle, Trash2 } from "lucide-react";
import {
  useCreateBorrowerMutation,
  useCreateAgentLoanMutation,
  useGetAgentBorrowersQuery,
  useLazyGetAgentLoansSummaryQuery,
  useLazyGetAgentBorrowersQuery,
  useLazyGetAgentBorrowerByIdQuery,
  useLazyGetAgentLoanByIdQuery,
} from "@/api/endpoints/agentApi";
import { useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";
import {
  EndpointCard,
  FieldGroup,
  EmptyNotice,
  type EndpointResult,
} from "../components/EndpointCard";
import type { Gender, RepaymentFrequency, Guarantor } from "@/types/agent.types";

// ── Agent Overview Page ────────────────────────────────────────────

export function AgentOverviewPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Agent Overview</h2>
          <p className="text-sm text-muted-foreground">
            Test agent API endpoints manually and inspect responses
          </p>
        </div>
      </div>

      {/* Endpoint Sections */}
      <CreateBorrowerSection />
      <CreateLoanSection />
      <GetLoansSummarySection />
      <GetBorrowersSection />
      <GetBorrowerByIdSection />
      <GetLoanByIdSection />
    </div>
  );
}

// ── Create Borrower ────────────────────────────────────────────────

function CreateBorrowerSection() {
  const [createBorrower, result] = useCreateBorrowerMutation();
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
    await createBorrower({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      home_address: homeAddress.trim(),
      market_id: marketId,
      gender: gender as Gender,
    });
  }

  const endpointResult: EndpointResult = {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    isUninitialized: result.isUninitialized,
  };

  return (
    <EndpointCard
      method="POST"
      path="/api/agent/borrowers"
      description="Create a new borrower"
      result={endpointResult}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="First Name" required>
          <input
            type="text"
            placeholder="e.g. Amaka"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>
        <FieldGroup label="Last Name" required>
          <input
            type="text"
            placeholder="e.g. Okafor"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Phone" required>
        <input
          type="tel"
          placeholder="e.g. 08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
          required
        />
      </FieldGroup>

      <FieldGroup label="Home Address" required>
        <input
          type="text"
          placeholder="e.g. 12 Balogun Street, Lagos"
          value={homeAddress}
          onChange={(e) => setHomeAddress(e.target.value)}
          className="input-field"
          required
        />
      </FieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Market" required>
          <select
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            className="input-field"
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
        </FieldGroup>

        <FieldGroup label="Gender" required>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="input-field"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </FieldGroup>
      </div>
    </EndpointCard>
  );
}

// ── Create Loan ────────────────────────────────────────────────────

const COLLECTION_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const emptyGuarantor = (): Guarantor => ({ name: "", phone: "", address: "" });

function CreateLoanSection() {
  const [createAgentLoan, result] = useCreateAgentLoanMutation();
  const { data: borrowersRes, isLoading: borrowersLoading } = useGetAgentBorrowersQuery();
  const borrowers = borrowersRes?.data?.data ?? [];

  // Required fields
  const [borrowerId, setBorrowerId] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [repaymentFrequency, setRepaymentFrequency] = useState<RepaymentFrequency | "">("");

  // Optional fields
  const [collectionDay, setCollectionDay] = useState("");
  const [collectionTime, setCollectionTime] = useState("");
  const [collectionLocation, setCollectionLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);

  function addGuarantor() {
    setGuarantors((prev) => [...prev, emptyGuarantor()]);
  }

  function removeGuarantor(index: number) {
    setGuarantors((prev) => prev.filter((_, i) => i !== index));
  }

  function updateGuarantor(index: number, field: keyof Guarantor, value: string) {
    setGuarantors((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrowerId || !repaymentFrequency) return;

    await createAgentLoan({
      // Required
      borrower_id: borrowerId,
      principal_amount: Number(principalAmount),
      interest_rate: Number(interestRate),
      duration_days: Number(durationDays),
      repayment_frequency: repaymentFrequency as RepaymentFrequency,
      // Optional — only include if non-empty
      ...(collectionDay && { collection_day: collectionDay }),
      ...(collectionTime && { collection_time: collectionTime }),
      ...(collectionLocation.trim() && { collection_location: collectionLocation.trim() }),
      ...(purpose.trim() && { purpose: purpose.trim() }),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(guarantors.length > 0 && { guarantors }),
    });
  }

  const endpointResult: EndpointResult = {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    isUninitialized: result.isUninitialized,
  };

  return (
    <EndpointCard
      method="POST"
      path="/api/agent/loans"
      description="Issue a new loan to an existing borrower"
      result={endpointResult}
      onSubmit={handleSubmit}
    >
      {/* ── Required Fields ──────────────────────────────────── */}
      <SectionLabel>Required Fields</SectionLabel>

      <FieldGroup label="Borrower" required>
        <select
          value={borrowerId}
          onChange={(e) => setBorrowerId(e.target.value)}
          className="input-field"
          required
          disabled={borrowersLoading}
        >
          <option value="">
            {borrowersLoading ? "Loading borrowers…" : "Select a borrower"}
          </option>
          {borrowers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.first_name} {b.last_name} — {b.phone}
            </option>
          ))}
        </select>
        {borrowerId && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            UUID: {borrowerId}
          </p>
        )}
      </FieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Principal Amount (₦)" required hint="Minimum ₦1,000">
          <input
            type="number"
            placeholder="e.g. 50000"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            className="input-field"
            min="1000"
            required
          />
        </FieldGroup>
        <FieldGroup label="Interest Rate (%)" required>
          <input
            type="number"
            placeholder="e.g. 5"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="input-field"
            min="0"
            step="0.01"
            required
          />
        </FieldGroup>
        <FieldGroup label="Duration (Days)" required hint="Minimum 1 day">
          <input
            type="number"
            placeholder="e.g. 30"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="input-field"
            min="1"
            step="1"
            required
          />
        </FieldGroup>
        <FieldGroup label="Repayment Frequency" required>
          <select
            value={repaymentFrequency}
            onChange={(e) => setRepaymentFrequency(e.target.value as RepaymentFrequency)}
            className="input-field"
            required
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </FieldGroup>
      </div>

      {/* ── Optional Fields ──────────────────────────────────── */}
      <SectionLabel>Optional Fields</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Collection Day">
          <select
            value={collectionDay}
            onChange={(e) => setCollectionDay(e.target.value)}
            className="input-field"
          >
            <option value="">None</option>
            {COLLECTION_DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Collection Time" hint='Format: H:i (e.g. 14:30)'>
          <input
            type="time"
            value={collectionTime}
            onChange={(e) => setCollectionTime(e.target.value)}
            className="input-field"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Collection Location">
        <input
          type="text"
          placeholder="e.g. Shop A12"
          value={collectionLocation}
          onChange={(e) => setCollectionLocation(e.target.value)}
          className="input-field"
        />
      </FieldGroup>

      <FieldGroup label="Purpose">
        <input
          type="text"
          placeholder="e.g. Restocking inventory"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="input-field"
        />
      </FieldGroup>

      <FieldGroup label="Notes">
        <textarea
          placeholder="e.g. Good credit history"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field h-20 resize-none py-2"
        />
      </FieldGroup>

      {/* ── Guarantors ───────────────────────────────────────── */}
      <SectionLabel>Guarantors</SectionLabel>

      {guarantors.map((g, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-muted/20 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Guarantor {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeGuarantor(i)}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Name" required>
              <input
                type="text"
                placeholder="e.g. Michael Smith"
                value={g.name}
                onChange={(e) => updateGuarantor(i, "name", e.target.value)}
                className="input-field"
              />
            </FieldGroup>
            <FieldGroup label="Phone" required>
              <input
                type="tel"
                placeholder="e.g. 08099887766"
                value={g.phone}
                onChange={(e) => updateGuarantor(i, "phone", e.target.value)}
                className="input-field"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Address" required>
            <input
              type="text"
              placeholder="e.g. 45 Broad St"
              value={g.address}
              onChange={(e) => updateGuarantor(i, "address", e.target.value)}
              className="input-field"
            />
          </FieldGroup>
        </div>
      ))}

      <button
        type="button"
        onClick={addGuarantor}
        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        Add Guarantor
      </button>
    </EndpointCard>
  );
}

// ── Get Loans Summary ──────────────────────────────────────────────

function GetLoansSummarySection() {
  const [trigger, result] = useLazyGetAgentLoansSummaryQuery();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trigger();
  }

  const endpointResult: EndpointResult = {
    data: result.data,
    isLoading: result.isLoading || result.isFetching,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    isUninitialized: result.isUninitialized,
  };

  return (
    <EndpointCard
      method="GET"
      path="/api/agent/loans/summary"
      description="Fetch agent loan summary statistics"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Fetch Summary"
    >
      <EmptyNotice />
    </EndpointCard>
  );
}

// ── Get All Borrowers ──────────────────────────────────────────────

function GetBorrowersSection() {
  const [trigger, result] = useLazyGetAgentBorrowersQuery();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trigger();
  }

  const endpointResult: EndpointResult = {
    data: result.data,
    isLoading: result.isLoading || result.isFetching,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    isUninitialized: result.isUninitialized,
  };

  return (
    <EndpointCard
      method="GET"
      path="/api/agent/borrowers"
      description="List all borrowers assigned to this agent"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Fetch Borrowers"
    >
      <EmptyNotice />
    </EndpointCard>
  );
}

// ── Get Borrower by ID ─────────────────────────────────────────────

function GetBorrowerByIdSection() {
  const [borrowerId, setBorrowerId] = useState("");
  const [trigger, result] = useLazyGetAgentBorrowerByIdQuery();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (borrowerId.trim()) trigger(borrowerId.trim());
  }

  const endpointResult: EndpointResult = {
    data: result.data,
    isLoading: result.isLoading || result.isFetching,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    isUninitialized: result.isUninitialized,
  };

  return (
    <EndpointCard
      method="GET"
      path="/api/agent/borrowers/{id}"
      description="Fetch a single borrower record by ID"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Fetch Borrower"
    >
      <FieldGroup label="Borrower ID" required hint="UUID string">
        <input
          type="text"
          placeholder="e.g. 0d68f230-014a-..."
          value={borrowerId}
          onChange={(e) => setBorrowerId(e.target.value)}
          className="input-field font-mono text-sm"
          required
        />
      </FieldGroup>
    </EndpointCard>
  );
}

// ── Get Loan by ID ─────────────────────────────────────────────────

function GetLoanByIdSection() {
  const [loanId, setLoanId] = useState("");
  const [trigger, result] = useLazyGetAgentLoanByIdQuery();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loanId.trim()) trigger(loanId.trim());
  }

  const endpointResult: EndpointResult = {
    data: result.data,
    isLoading: result.isLoading || result.isFetching,
    isError: result.isError,
    error: result.error,
    isSuccess: result.isSuccess,
    isUninitialized: result.isUninitialized,
  };

  return (
    <EndpointCard
      method="GET"
      path="/api/agent/loans/{id}"
      description="Fetch a single loan record by ID"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Fetch Loan"
    >
      <FieldGroup label="Loan ID" required hint="UUID string">
        <input
          type="text"
          placeholder="e.g. 0d68f230-014a-..."
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          className="input-field font-mono text-sm"
          required
        />
      </FieldGroup>
    </EndpointCard>
  );
}

// ── Section Label ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
