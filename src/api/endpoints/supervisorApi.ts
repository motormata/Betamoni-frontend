import { baseApi } from "../baseApi";
import type { UUID } from "@/types/common.types";
import type {
  RejectLoanPayload,
  DisburseLoanPayload,
  SupervisorLoanActionResponse,
  SupervisorLoansSummaryResponse,
  SupervisorLoansListResponse,
  SupervisorLoanDetailResponse,
  SupervisorLoansQueryParams,
  AgentsPerformanceResponse,
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
    getSupervisorLoans: builder.query<SupervisorLoansListResponse, SupervisorLoansQueryParams>({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params.page) sp.set("page", String(params.page));
        if (params.status) sp.set("status", params.status);
        if (params.agent_id) sp.set("agent_id", params.agent_id);
        if (params.market_id) sp.set("market_id", params.market_id);
        if (params.from_date) sp.set("from_date", params.from_date);
        if (params.to_date) sp.set("to_date", params.to_date);
        if (params.search) sp.set("search", params.search);
        const qs = sp.toString();
        return `/api/supervisor/loans${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["SupervisorLoans"],
    }),

    // ── GET /api/supervisor/agents-performance ─────────────────
    getAgentsPerformance: builder.query<AgentsPerformanceResponse, void>({
      query: () => "/api/supervisor/agents-performance",
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
  useGetAgentsPerformanceQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useDisburseLoanMutation,
} = supervisorApi;
