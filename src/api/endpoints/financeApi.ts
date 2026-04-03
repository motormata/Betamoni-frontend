import { baseApi } from "../baseApi";
import type { FinanceLedgerEntry, FinanceHistoryResponse } from "@/types/product.types";

// ── Types ──────────────────────────────────────────────────────────

export interface AddCapitalPayload {
  amount: number;
  description: string;
  transaction_date: string; // YYYY-MM-DD
}

export interface AddCapitalResponse {
  success: boolean;
  message: string;
  data: unknown;
}

// ── Finance API Endpoints ──────────────────────────────────────────

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── POST /api/admin/cash-ledger/add-capital ───────────────
    addCapital: builder.mutation<AddCapitalResponse, AddCapitalPayload>({
      query: (body) => ({
        url: "/api/admin/cash-ledger/add-capital",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Loans", "Transactions"],
    }),

    // ── GET /api/cash-ledger?type=capital_in ──────────────────
    getFinanceHistory: builder.query<FinanceHistoryResponse, number | void>({
      query: (page = 1) => `/api/cash-ledger?type=capital_in&page=${page}`,
      providesTags: ["Transactions"],
    }),
  }),
});

export const { useAddCapitalMutation, useGetFinanceHistoryQuery } = financeApi;
export type { FinanceLedgerEntry };
