import type { ApiResponse } from "@/types/auth.types";
import type { UUID, PaginatedData } from "@/types/common.types";

// ── Request Payload Types ──────────────────────────────────────────

export type Gender = "male" | "female";
export type RepaymentFrequency = "daily" | "weekly" | "bi-weekly" | "monthly";


export interface CreateBorrowerPayload {
  first_name: string;
  last_name: string;
  phone: string;
  home_address: string;
  market_id: UUID;
  gender: Gender;
}

export interface CreateAgentLoanPayload {
  borrower_id: UUID;
  loan_product_id: UUID;
  quantity: number;
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
  loans?: AgentLoan[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface LoanPayment {
  id: UUID;
  loan_id: UUID;
  amount: string;
  payment_date: string;
  payment_time?: string;
  payment_method: string;
  receipt_number?: string;
  repayment_schedule_id?: UUID;
  is_verified?: boolean;
  collected_by?: { id: UUID; name: string; email: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface LoanActivity {
  id: UUID;
  loan_id: UUID;
  action: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  user?: { id: UUID; name: string; [key: string]: unknown };
}

export interface AgentLoan {
  id: UUID;
  loan_number?: string;
  borrower_id: UUID;
  agent_id?: UUID;
  market_id?: UUID;
  loan_product_id?: UUID;
  quantity?: number;
  // Financial fields
  principal_amount: number | string;
  interest_rate: number | string;
  interest_amount?: number | string;
  total_amount?: number | string;
  amount_paid?: number | string;
  balance?: number | string;
  installment_amount?: number | string | null;
  // Schedule fields
  duration_days: number;
  repayment_frequency: string;
  disbursement_date?: string | null;
  due_date?: string | null;
  // Status & meta
  status: string;
  purpose?: string | null;
  collection_day?: string | null;
  collection_time?: string | null;
  collection_location?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  disbursed_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  borrower?: { id: UUID; first_name: string; last_name: string; phone: string; full_name?: string; [key: string]: unknown };
  agent?: { id: UUID; name: string; email: string; [key: string]: unknown };
  approved_by?: { id: UUID; name: string; email: string; [key: string]: unknown };
  payments?: LoanPayment[];
  activities?: LoanActivity[];
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
