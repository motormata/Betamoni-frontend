import type { ApiResponse } from "./auth.types";
import type { UUID, PaginatedData } from "./common.types";

// ── Payment Types ──────────────────────────────────────────────────

export type PaymentMethod = "cash" | "transfer" | "pos";

// ── Request Payloads ───────────────────────────────────────────────

export interface CreatePaymentPayload {
  loan_id: UUID;
  amount: number;
  payment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  repayment_schedule_id?: UUID;
}

export interface PaymentQueryParams {
  loan_id?: UUID;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
}

// ── Response Data Types ────────────────────────────────────────────

export interface Payment {
  id: UUID;
  loan_id: UUID;
  amount: number;
  payment_date: string;
  payment_method: string;
  repayment_schedule_id: UUID | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// ── Composed API Response Types ────────────────────────────────────

export type CreatePaymentResponse = ApiResponse<Payment>;
export type PaymentsResponse = ApiResponse<PaginatedData<Payment>>;
