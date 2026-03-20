import { baseApi } from "../baseApi";
import type {
  RolesResponse,
  UsersResponse,
  CreateUserPayload,
  CreateUserResponse,
  AssignMarketPayload,
  AssignMarketResponse,
} from "@/types/staff.types";

// ── Staff API Endpoints ────────────────────────────────────────────

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Get all users ────────────────────────────────────────────
    getUsers: builder.query<UsersResponse, void>({
      query: () => "/api/admin/users",
      providesTags: ["User"],
    }),

    // ── Get roles (for the role selector) ────────────────────────
    getRoles: builder.query<RolesResponse, void>({
      query: () => "/api/admin/roles",
    }),

    // ── Create a new user ───────────────────────────────────────
    createUser: builder.mutation<CreateUserResponse, CreateUserPayload>({
      query: (body) => ({
        url: "/api/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ── Assign / move agent to a market ────────────────────────
    // POST /api/admin/users/{id}/assign-market
    assignMarket: builder.mutation<AssignMarketResponse, AssignMarketPayload>({
      query: ({ userId, market_id }) => ({
        url: `/api/admin/users/${userId}/assign-market`,
        method: "POST",
        body: { market_id },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useAssignMarketMutation,
} = staffApi;
