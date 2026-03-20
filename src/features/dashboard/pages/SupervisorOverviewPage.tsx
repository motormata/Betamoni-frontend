import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  useLazyGetSupervisorLoansSummaryQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useDisburseLoanMutation,
} from "@/api/endpoints/supervisorApi";
import {
  EndpointCard,
  FieldGroup,
  EmptyNotice,
  type EndpointResult,
} from "../components/EndpointCard";

// ── Supervisor Overview Page ───────────────────────────────────────

export function SupervisorOverviewPage() {
  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Supervisor Overview</h2>
          <p className="text-sm text-muted-foreground">
            Test supervisor API endpoints manually and inspect responses
          </p>
        </div>
      </div>

      {/* Endpoint Sections */}
      <GetSupervisorLoansSummarySection />
      <ApproveLoanSection />
      <RejectLoanSection />
      <DisburseLoanSection />
    </div>
  );
}

// ── Get Supervisor Loans Summary ───────────────────────────────────

function GetSupervisorLoansSummarySection() {
  const [trigger, result] = useLazyGetSupervisorLoansSummaryQuery();

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
      path="/api/supervisor/loans/summary"
      description="Fetch supervisor loan summary statistics"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Fetch Summary"
    >
      <EmptyNotice />
    </EndpointCard>
  );
}

// ── Approve Loan ───────────────────────────────────────────────────

function ApproveLoanSection() {
  const [loanId, setLoanId] = useState("");
  const [approveLoan, result] = useApproveLoanMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loanId) await approveLoan(loanId.trim());
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
      path="/api/supervisor/loans/{id}/approve"
      description="Approve a pending loan application"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Approve Loan"
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

// ── Reject Loan ────────────────────────────────────────────────────

function RejectLoanSection() {
  const [loanId, setLoanId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoan, result] = useRejectLoanMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loanId && rejectionReason.trim()) {
      await rejectLoan({
        id: loanId.trim(),
        rejection_reason: rejectionReason.trim(),
      });
    }
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
      path="/api/supervisor/loans/{id}/reject"
      description="Reject a loan with a reason"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Reject Loan"
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
      <FieldGroup label="Rejection Reason" required>
        <textarea
          placeholder="e.g. Insufficient repayment history"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="input-field h-20 resize-none py-2"
          required
        />
      </FieldGroup>
    </EndpointCard>
  );
}

// ── Disburse Loan ──────────────────────────────────────────────────

function DisburseLoanSection() {
  const [loanId, setLoanId] = useState("");
  const [disbursementDate, setDisbursementDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [disburseLoan, result] = useDisburseLoanMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loanId && disbursementDate) {
      await disburseLoan({
        id: loanId.trim(),
        disbursement_date: disbursementDate,
      });
    }
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
      path="/api/supervisor/loans/{id}/disburse"
      description="Mark a loan as disbursed"
      result={endpointResult}
      onSubmit={handleSubmit}
      submitLabel="Disburse Loan"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <FieldGroup
          label="Disbursement Date"
          required
          hint="Format: YYYY-MM-DD"
        >
          <input
            type="date"
            value={disbursementDate}
            onChange={(e) => setDisbursementDate(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>
      </div>
    </EndpointCard>
  );
}
