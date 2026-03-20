import { baseApi } from "../baseApi";
import type {
  CreatePaymentPayload,
  CreatePaymentResponse,
  PaymentQueryParams,
  PaymentsResponse,
} from "@/types/payment.types";

// ── Payment API Endpoints ──────────────────────────────────────────

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── POST /api/payments ────────────────────────────────────
    createPayment: builder.mutation<CreatePaymentResponse, CreatePaymentPayload>({
      query: (body) => ({
        url: "/api/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments", "AgentLoans"],
    }),

    // ── GET /api/payments ─────────────────────────────────────
    getPayments: builder.query<PaymentsResponse, PaymentQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.loan_id) searchParams.set("loan_id", params.loan_id);
        if (params.from_date) searchParams.set("from_date", params.from_date);
        if (params.to_date) searchParams.set("to_date", params.to_date);
        const qs = searchParams.toString();
        return `/api/payments${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Payments"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useLazyGetPaymentsQuery,
} = paymentApi;
