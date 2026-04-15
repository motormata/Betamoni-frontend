import { baseApi } from "../baseApi";
import type {
  DashboardSummaryResponse,
  ActiveLoansResponse,
  CashPositionResponse,
  DailyCollectionsResponse,
  TodayRepaymentsResponse,
  HistoricalResponse,
  DashboardQueryParams,
  HistoricalQueryParams,
} from "@/types/dashboard.types";

// ── Dashboard API Endpoints ────────────────────────────────────────

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Dashboard Summary (super-endpoint) ──────────────────────
    // Returns: cash_position, active_loans, today.collections,
    //          today.expected_repayments, portfolio — all in one call.
    // market_id is optional; omit for platform-wide data.
    getDashboardSummary: builder.query<DashboardSummaryResponse, Pick<DashboardQueryParams, "market_id">>({
      query: ({ market_id }) => ({
        url: "/api/dashboard",
        params: market_id ? { market_id } : undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // ── Active Loans (standalone — kept for drill-down use) ─────
    getActiveLoans: builder.query<ActiveLoansResponse, Pick<DashboardQueryParams, "market_id">>({
      query: ({ market_id }) => ({
        url: "/api/dashboard/active-loans",
        params: market_id ? { market_id } : undefined,
      }),
      providesTags: ["Dashboard"],
    }),

    // ── Historical (chart data) ─────────────────────────────────
    // market_id is optional; omit for platform-wide data.
    getHistorical: builder.query<HistoricalResponse, HistoricalQueryParams>({
      query: ({ market_id, from_date, to_date }) => ({
        url: "/api/dashboard/historical",
        params: { ...(market_id ? { market_id } : {}), from_date, to_date },
      }),
      providesTags: ["Dashboard"],
    }),

    // ── Individual endpoints (kept for flexibility / future use) ─
    getCashPosition: builder.query<CashPositionResponse, DashboardQueryParams>({
      query: ({ market_id, date }) => ({
        url: "/api/dashboard/cash-position",
        params: { market_id, date },
      }),
      providesTags: ["Dashboard"],
    }),

    getDailyCollections: builder.query<DailyCollectionsResponse, DashboardQueryParams>({
      query: ({ market_id, date }) => ({
        url: "/api/dashboard/daily-collections",
        params: { market_id, date },
      }),
      providesTags: ["Dashboard"],
    }),

    getTodayRepayments: builder.query<TodayRepaymentsResponse, DashboardQueryParams>({
      query: ({ market_id, date }) => ({
        url: "/api/dashboard/today-repayments",
        params: { market_id, date },
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetActiveLoansQuery,
  useGetHistoricalQuery,
  useGetCashPositionQuery,
  useGetDailyCollectionsQuery,
  useGetTodayRepaymentsQuery,
} = dashboardApi;
