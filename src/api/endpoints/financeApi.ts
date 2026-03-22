import { baseApi } from "../baseApi";

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
    addCapital: builder.mutation<AddCapitalResponse, AddCapitalPayload>({
      query: (body) => ({
        url: "/api/admin/cash-ledger/add-capital",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Loans", "Transactions"],
    }),
  }),
});

export const { useAddCapitalMutation } = financeApi;
