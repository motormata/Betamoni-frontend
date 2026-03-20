import type { ApiResponse } from "@/types/auth.types";
import type { UUID, PaginatedData } from "@/types/common.types";

// ── Request Payload Types ──────────────────────────────────────────

export interface RejectLoanPayload {
  id: UUID;
  rejection_reason: string;
}

export interface DisburseLoanPayload {
  id: UUID;
  disbursement_date: string;
}

// ── Response Data Types ────────────────────────────────────────────

export interface SupervisorLoan {
  id: UUID;
  borrower_id: UUID;
  agent_id: UUID;
  principal_amount: number;
  interest_rate: number;
  duration_days: number;
  repayment_frequency: string;
  status: string;
  purpose?: string;
  collection_day?: string;
  collection_time?: string;
  collection_location?: string;
  created_at?: string;
  updated_at?: string;
  borrower?: {
    id: UUID;
    first_name: string;
    last_name: string;
    phone: string;
    [key: string]: unknown;
  };
  agent?: {
    id: UUID;
    name: string;
    email: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ── Composed API Response Types ────────────────────────────────────

export type SupervisorLoanActionResponse = ApiResponse<unknown>;
export type SupervisorLoansSummaryResponse = ApiResponse<Record<string, unknown>>;
export type SupervisorLoansListResponse = ApiResponse<PaginatedData<SupervisorLoan>>;
export type SupervisorLoanDetailResponse = ApiResponse<SupervisorLoan>;
