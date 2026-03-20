import { baseApi } from "../baseApi";
import type { UUID } from "@/types/common.types";
import type {
  CreateBorrowerPayload,
  CreateBorrowerResponse,
  CreateAgentLoanPayload,
  CreateAgentLoanResponse,
  AgentBorrowersResponse,
  AgentLoansResponse,
  AgentBorrowerResponse,
  AgentLoanResponse,
  AgentLoansSummaryResponse,
} from "@/types/agent.types";

// ── Agent API Endpoints ────────────────────────────────────────────

export const agentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── POST /api/agent/borrowers ─────────────────────────────
    createBorrower: builder.mutation<CreateBorrowerResponse, CreateBorrowerPayload>({
      query: (body) => ({
        url: "/api/agent/borrowers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Borrowers"],
    }),

    // ── POST /api/agent/loans ─────────────────────────────────
    createAgentLoan: builder.mutation<CreateAgentLoanResponse, CreateAgentLoanPayload>({
      query: (body) => ({
        url: "/api/agent/loans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AgentLoans"],
    }),

    // ── GET /api/agent/loans/summary ──────────────────────────
    getAgentLoansSummary: builder.query<AgentLoansSummaryResponse, void>({
      query: () => "/api/agent/loans/summary",
      providesTags: ["AgentLoans"],
    }),

    // ── GET /api/agent/loans ──────────────────────────────────
    getAgentLoans: builder.query<AgentLoansResponse, number | void>({
      query: (page = 1) => `/api/agent/loans?page=${page}`,
      providesTags: ["AgentLoans"],
    }),

    // ── GET /api/agent/borrowers ──────────────────────────────
    getAgentBorrowers: builder.query<AgentBorrowersResponse, number | void>({
      query: (page = 1) => `/api/agent/borrowers?page=${page}`,
      providesTags: ["Borrowers"],
    }),

    // ── GET /api/agent/borrowers/{id} ─────────────────────────
    getAgentBorrowerById: builder.query<AgentBorrowerResponse, UUID>({
      query: (id) => `/api/agent/borrowers/${id}`,
      providesTags: ["Borrowers"],
    }),

    // ── GET /api/agent/loans/{id} ─────────────────────────────
    getAgentLoanById: builder.query<AgentLoanResponse, UUID>({
      query: (id) => `/api/agent/loans/${id}`,
      providesTags: ["AgentLoans"],
    }),
  }),
});

export const {
  useCreateBorrowerMutation,
  useCreateAgentLoanMutation,
  useGetAgentLoansSummaryQuery,
  useGetAgentLoansQuery,
  useGetAgentBorrowersQuery,
  useLazyGetAgentLoansSummaryQuery,
  useLazyGetAgentBorrowersQuery,
  useLazyGetAgentBorrowerByIdQuery,
  useLazyGetAgentLoanByIdQuery,
  useGetAgentBorrowerByIdQuery,
  useGetAgentLoanByIdQuery,
} = agentApi;
