import { baseApi } from "../baseApi";
import type {
  LoanProduct,
  CreateLoanProductPayload,
  CreateLoanProductResponse,
  LoanProductsResponse,
} from "@/types/product.types";

// ── Products API ────────────────────────────────────────────────────

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── POST /api/admin/products ──────────────────────────────
    createLoanProduct: builder.mutation<CreateLoanProductResponse, CreateLoanProductPayload>({
      query: (body) => ({
        url: "/api/admin/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LoanProducts"],
    }),

    // ── GET /api/admin/products ───────────────────────────────
    getAdminProducts: builder.query<LoanProductsResponse, void>({
      query: () => "/api/admin/products",
      providesTags: ["LoanProducts"],
    }),

    // ── GET /api/supervisor/products ─────────────────────────
    getSupervisorProducts: builder.query<LoanProductsResponse, void>({
      query: () => "/api/supervisor/products",
      providesTags: ["LoanProducts"],
    }),

    // ── GET /api/agent/products ───────────────────────────────
    getAgentProducts: builder.query<LoanProductsResponse, void>({
      query: () => "/api/agent/products",
      providesTags: ["LoanProducts"],
    }),
  }),
});

export const {
  useCreateLoanProductMutation,
  useGetAdminProductsQuery,
  useGetSupervisorProductsQuery,
  useGetAgentProductsQuery,
} = productsApi;

// Re-export type for convenience
export type { LoanProduct };
