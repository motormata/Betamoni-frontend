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

// ── Today Repayments Response ─────────────────────────────────────

export interface TodayRepaymentsData {
  date: string;
  total_schedules: number;
  pending_count: number;
  paid_count: number;
  total_expected: number;
  total_collected: number;
  outstanding: number;
  collection_rate: number;
  pending_list: TodayRepaymentPendingItem[];
}

export interface TodayRepaymentPendingItem {
  schedule_id: string;
  loan_id?: UUID;
  loan_number: string;
  borrower_name: string;
  borrower_phone: string;
  expected_amount: number | string;
  amount_paid: number | string;
  remaining: number | string;
  location: string | null;
}

export interface TodayRepaymentsResponse {
  success: boolean;
  data: TodayRepaymentsData;
}

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

    // ── GET /api/dashboard/today-repayments ───────────────────
    getTodayRepayments: builder.query<TodayRepaymentsResponse, string | void>({
      query: (date) =>
        date
          ? `/api/dashboard/today-repayments?date=${date}`
          : "/api/dashboard/today-repayments",
      providesTags: ["TodayRepayments"],
    }),
  }),
});

export const {
  useCreateBorrowerMutation,
  useCreateAgentLoanMutation,
  useGetAgentLoansSummaryQuery,
  useGetAgentLoansQuery,
  useLazyGetAgentLoansQuery,
  useGetAgentBorrowersQuery,
  useLazyGetAgentLoansSummaryQuery,
  useLazyGetAgentBorrowersQuery,
  useLazyGetAgentBorrowerByIdQuery,
  useLazyGetAgentLoanByIdQuery,
  useGetAgentBorrowerByIdQuery,
  useGetAgentLoanByIdQuery,
  useGetTodayRepaymentsQuery,
} = agentApi;
