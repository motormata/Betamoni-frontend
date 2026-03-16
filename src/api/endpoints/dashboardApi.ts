import { baseApi } from "../baseApi";
import type {
  CashPositionResponse,
  DailyCollectionsResponse,
  TodayRepaymentsResponse,
  HistoricalResponse,
  MarketsResponse,
  DashboardQueryParams,
  HistoricalQueryParams,
} from "@/types/dashboard.types";

// ── Dashboard API Endpoints ────────────────────────────────────────

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Markets list (for the selector dropdown) ────────────────
    getMarkets: builder.query<MarketsResponse, void>({
      query: () => "/api/markets",
      providesTags: ["User"],
    }),

    // ── Cash Position ───────────────────────────────────────────
    getCashPosition: builder.query<CashPositionResponse, DashboardQueryParams>({
      query: ({ market_id, date }) => ({
        url: "/api/dashboard/cash-position",
        params: { market_id, date },
      }),
    }),

    // ── Daily Collections ───────────────────────────────────────
    getDailyCollections: builder.query<DailyCollectionsResponse, DashboardQueryParams>({
      query: ({ market_id, date }) => ({
        url: "/api/dashboard/daily-collections",
        params: { market_id, date },
      }),
    }),

    // ── Today Repayments ────────────────────────────────────────
    getTodayRepayments: builder.query<TodayRepaymentsResponse, DashboardQueryParams>({
      query: ({ market_id, date }) => ({
        url: "/api/dashboard/today-repayments",
        params: { market_id, date },
      }),
    }),

    // ── Historical (chart data) ─────────────────────────────────
    getHistorical: builder.query<HistoricalResponse, HistoricalQueryParams>({
      query: ({ market_id, from_date, to_date }) => ({
        url: "/api/dashboard/historical",
        params: { market_id, from_date, to_date },
      }),
    }),
  }),
});

export const {
  useGetMarketsQuery,
  useGetCashPositionQuery,
  useGetDailyCollectionsQuery,
  useGetTodayRepaymentsQuery,
  useGetHistoricalQuery,
} = dashboardApi;
