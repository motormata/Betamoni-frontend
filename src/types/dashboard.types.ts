// ── Dashboard API Response Types ───────────────────────────────────
// Derived from actual backend payloads

import type { ApiResponse } from "./auth.types";

// ── Query Params ───────────────────────────────────────────────────

export interface DashboardQueryParams {
  market_id: number;
  date?: string; // YYYY-MM-DD
}

export interface HistoricalQueryParams {
  market_id: number;
  from_date: string; // YYYY-MM-DD
  to_date: string; // YYYY-MM-DD
}

// ── Cash Position ──────────────────────────────────────────────────
// GET /api/dashboard/cash-position?market_id=&date=

export interface CashPositionData {
  cash_in_hand: number;
  as_of_date: string;
  currency: string;
}

// ── Daily Collections ──────────────────────────────────────────────
// GET /api/dashboard/daily-collections?market_id=&date=

export interface LoanTypeBreakdown {
  count: number;
  total_amount: number;
}

export interface DailyCollectionsData {
  date: string;
  total_recovered: number;
  by_loan_type: {
    daily: LoanTypeBreakdown;
    weekly: LoanTypeBreakdown;
    monthly: LoanTypeBreakdown;
  };
  payment_count: number;
}

// ── Today Repayments ───────────────────────────────────────────────
// GET /api/dashboard/today-repayments?market_id=&date=

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

// ── Historical ─────────────────────────────────────────────────────
// GET /api/dashboard/historical?market_id=&from_date=&to_date=

export interface HistoricalDayEntry {
  date: string;
  collections: DailyCollectionsData;
  repayments: TodayRepaymentsData;
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

// ── Active Loans (placeholder — endpoint currently errors) ─────────
// GET /api/dashboard/active-loans?market_id=

export interface ActiveLoansData {
  total_active: number;
  total_amount: number;
  by_type?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// ── Dashboard KPIs (placeholder — endpoint currently errors) ───────
// GET /api/dashboard?market_id=

export interface DashboardKpiData {
  clusters: number;
  borrowers: number;
  active_loans: number;
}

// ── Market (from GET /api/markets) ─────────────────────────────────

export interface Market {
  id: number;
  name: string;
  code: string;
  region_id: number;
  address?: string;
}

// ── Typed API responses ────────────────────────────────────────────

export type CashPositionResponse = ApiResponse<CashPositionData>;
export type DailyCollectionsResponse = ApiResponse<DailyCollectionsData>;
export type TodayRepaymentsResponse = ApiResponse<TodayRepaymentsData>;
export type HistoricalResponse = ApiResponse<HistoricalData>;
export type ActiveLoansResponse = ApiResponse<ActiveLoansData>;
export type DashboardKpiResponse = ApiResponse<DashboardKpiData>;
export type MarketsResponse = ApiResponse<Market[]>;
