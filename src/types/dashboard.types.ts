// ── Dashboard API Response Types ───────────────────────────────────
// Derived from actual backend payloads

import type { ApiResponse } from "./auth.types";
import type { UUID } from "./common.types";

// ── Query Params ───────────────────────────────────────────────────

export interface DashboardQueryParams {
  market_id?: UUID;  // optional — omit to get platform-wide data
  date?: string;     // YYYY-MM-DD
}

export interface HistoricalQueryParams {
  market_id?: UUID;  // optional — omit to get platform-wide data
  from_date: string; // YYYY-MM-DD
  to_date: string;   // YYYY-MM-DD
}

// ── Shared Sub-types ───────────────────────────────────────────────

export interface LoanTypeAmount {
  count: number;
  total_amount: number;
}

export interface LoanTypePrincipal {
  count: number;
  total_principal: number;
}

// ── Cash Position ──────────────────────────────────────────────────

export interface CashPositionData {
  cash_in_hand: number;
  as_of_date: string;
  currency: string;
}

// ── Daily Collections ──────────────────────────────────────────────

export interface DailyCollectionsData {
  date: string;
  total_recovered: number;
  by_loan_type: {
    daily: LoanTypeAmount;
    weekly: LoanTypeAmount;
    monthly: LoanTypeAmount;
  };
  payment_count: number;
}

// ── Today Repayments ───────────────────────────────────────────────

export interface TodayRepaymentsData {
  date: string;
  total_schedules: number;
  pending_count: number;
  paid_count: number;
  total_expected: number;
  total_collected: number;
  outstanding: number;
  collection_rate: number;
}

// ── Active Loans ───────────────────────────────────────────────────

export interface ActiveLoansData {
  total_active_loans: number;
  by_type: {
    daily: LoanTypePrincipal;
    weekly: LoanTypePrincipal;
    monthly: LoanTypePrincipal;
  };
}

// ── Portfolio ──────────────────────────────────────────────────────

export interface PortfolioBreakdown {
  total_expected: number;
  total_received: number;
  total_outstanding: number;
  current_outstanding: number;
  overdue_outstanding: number;
}

export interface PortfolioData {
  total_exposure: number;
  breakdown: PortfolioBreakdown;
  loan_count: number;
  recovery_rate: number;
}

// ── Dashboard Summary (super-endpoint) ────────────────────────────
// GET /api/dashboard?market_id=

export interface DashboardSummaryData {
  cash_position: CashPositionData;
  active_loans: ActiveLoansData;
  today: {
    collections: DailyCollectionsData;
    expected_repayments: TodayRepaymentsData;
  };
  portfolio: PortfolioData;
}

// ── Historical ─────────────────────────────────────────────────────

export interface HistoricalMarketEntry {
  market_id: UUID;
  market_name: string;
  collections: number | string;
  expected: number;
  collection_rate: number;
}

export interface HistoricalDayEntry {
  date: string;
  total_collections: number;
  total_expected: number;
  markets: HistoricalMarketEntry[];
}

export interface HistoricalData {
  period: {
    from: string;
    to: string;
    days: number;
  };
  summary: {
    total_collected: number;
    total_expected: number;
    collection_rate: number;
  };
  daily_breakdown: HistoricalDayEntry[];
}

// ── Markets ────────────────────────────────────────────────────────

export interface Market {
  id: UUID;
  name: string;
  code: string;
  region_id: UUID;
  address?: string;
}

// ── Typed API Response Wrappers ────────────────────────────────────

export type DashboardSummaryResponse = ApiResponse<DashboardSummaryData>;
export type ActiveLoansResponse = ApiResponse<ActiveLoansData>;
export type CashPositionResponse = ApiResponse<CashPositionData>;
export type DailyCollectionsResponse = ApiResponse<DailyCollectionsData>;
export type TodayRepaymentsResponse = ApiResponse<TodayRepaymentsData>;
export type HistoricalResponse = ApiResponse<HistoricalData>;
export type MarketsResponse = ApiResponse<Market[]>;
