import type { ApiResponse } from "@/types/auth.types";
import type { UUID, PaginatedData } from "@/types/common.types";
import type { RepaymentFrequency } from "@/types/agent.types";

// ── Loan Product ────────────────────────────────────────────────────

export interface LoanProduct {
  id: UUID;
  name: string;
  description?: string;
  principal_amount: number;
  interest_rate: number;
  duration_days: number;
  repayment_frequency: RepaymentFrequency;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Create Payload ──────────────────────────────────────────────────

export interface CreateLoanProductPayload {
  name: string;
  description?: string;
  principal_amount: number;
  interest_rate: number;
  duration_days: number;
  repayment_frequency: RepaymentFrequency;
  is_active: boolean;
}

// ── Finance Ledger ──────────────────────────────────────────────────

export interface FinanceLedgerEntry {
  id: UUID;
  amount: number;
  description: string;
  transaction_date: string;
  type: string;
  created_at?: string;
  [key: string]: unknown;
}

// ── Composed Response Types ─────────────────────────────────────────

export type CreateLoanProductResponse = ApiResponse<LoanProduct>;
export type LoanProductsResponse = ApiResponse<LoanProduct[]>;
export type FinanceHistoryResponse = ApiResponse<PaginatedData<FinanceLedgerEntry>>;
