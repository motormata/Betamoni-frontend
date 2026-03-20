import { baseApi } from "../baseApi";
import type { UUID } from "@/types/common.types";
import type {
  RejectLoanPayload,
  DisburseLoanPayload,
  SupervisorLoanActionResponse,
  SupervisorLoansSummaryResponse,
  SupervisorLoansListResponse,
  SupervisorLoanDetailResponse,
} from "@/types/supervisor.types";

// ── Supervisor API Endpoints ───────────────────────────────────────

export const supervisorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET /api/supervisor/loans/summary ─────────────────────
    getSupervisorLoansSummary: builder.query<SupervisorLoansSummaryResponse, void>({
      query: () => "/api/supervisor/loans/summary",
      providesTags: ["SupervisorLoans"],
    }),

    // ── GET /api/supervisor/loans ─────────────────────────────
    getSupervisorLoans: builder.query<SupervisorLoansListResponse, number | void>({
      query: (page = 1) => `/api/supervisor/loans?page=${page}`,
      providesTags: ["SupervisorLoans"],
    }),

    // ── GET /api/supervisor/loans/{id} ────────────────────────
    getSupervisorLoanById: builder.query<SupervisorLoanDetailResponse, UUID>({
      query: (id) => `/api/supervisor/loans/${id}`,
      providesTags: ["SupervisorLoans"],
    }),

    // ── POST /api/supervisor/loans/{id}/approve ───────────────
    approveLoan: builder.mutation<SupervisorLoanActionResponse, UUID>({
      query: (id) => ({
        url: `/api/supervisor/loans/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["SupervisorLoans"],
    }),

    // ── POST /api/supervisor/loans/{id}/reject ────────────────
    rejectLoan: builder.mutation<SupervisorLoanActionResponse, RejectLoanPayload>({
      query: ({ id, rejection_reason }) => ({
        url: `/api/supervisor/loans/${id}/reject`,
        method: "POST",
        body: { rejection_reason },
      }),
      invalidatesTags: ["SupervisorLoans"],
    }),

    // ── POST /api/supervisor/loans/{id}/disburse ──────────────
    disburseLoan: builder.mutation<SupervisorLoanActionResponse, DisburseLoanPayload>({
      query: ({ id, disbursement_date }) => ({
        url: `/api/supervisor/loans/${id}/disburse`,
        method: "POST",
        body: { disbursement_date },
      }),
      invalidatesTags: ["SupervisorLoans"],
    }),
  }),
});

export const {
  useGetSupervisorLoansSummaryQuery,
  useLazyGetSupervisorLoansSummaryQuery,
  useGetSupervisorLoansQuery,
  useGetSupervisorLoanByIdQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useDisburseLoanMutation,
} = supervisorApi;
