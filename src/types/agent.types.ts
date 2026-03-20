import type { ApiResponse } from "@/types/auth.types";
import type { UUID, PaginatedData } from "@/types/common.types";

// ── Request Payload Types ──────────────────────────────────────────

export type Gender = "male" | "female";
export type RepaymentFrequency = "daily" | "weekly" | "bi-weekly" | "monthly";

export interface Guarantor {
  name: string;
  phone: string;
  address: string;
}

export interface CreateBorrowerPayload {
  first_name: string;
  last_name: string;
  phone: string;
  home_address: string;
  market_id: UUID;
  gender: Gender;
}

export interface CreateAgentLoanPayload {
  // Required fields
  borrower_id: UUID;
  principal_amount: number;
  interest_rate: number;
  duration_days: number;
  repayment_frequency: RepaymentFrequency;
  // Optional fields
  collection_day?: string;
  collection_time?: string;
  collection_location?: string;
  purpose?: string;
  notes?: string;
  guarantors?: Guarantor[];
}

// ── Response Data Types ────────────────────────────────────────────

export interface Borrower {
  id: UUID;
  first_name: string;
  last_name: string;
  phone: string;
  home_address: string;
  market_id: UUID;
  gender: string;
  full_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AgentLoan {
  id: UUID;
  borrower_id: UUID;
  principal_amount: number;
  interest_rate: number;
  duration_days: number;
  repayment_frequency: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ── Composed API Response Types ────────────────────────────────────

export type CreateBorrowerResponse = ApiResponse<Borrower>;
export type CreateAgentLoanResponse = ApiResponse<AgentLoan>;
export type AgentBorrowersResponse = ApiResponse<PaginatedData<Borrower>>;
export type AgentLoansResponse = ApiResponse<PaginatedData<AgentLoan>>;
export type AgentBorrowerResponse = ApiResponse<Borrower>;
export type AgentLoanResponse = ApiResponse<AgentLoan>;
export type AgentLoansSummaryResponse = ApiResponse<Record<string, unknown>>;
