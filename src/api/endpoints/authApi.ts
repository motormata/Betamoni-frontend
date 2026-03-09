import { baseApi } from "../baseApi";
import type {
  LoginCredentials,
  AuthResponse,
  User,
  ApiResponse,
} from "@/types/auth.types";
import {
  setCredentials,
  setUser,
  clearCredentials,
} from "@/store/slices/authSlice";

// ── Auth API Endpoints ─────────────────────────────────────────────

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Login ────────────────────────────────────────────────────
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/api/login",
        method: "POST",
        body: credentials,
      }),
      // NOTE: Do NOT use invalidatesTags here!
      // It would trigger a refetch of getCurrentUser (providesTags: ['Auth']),
      // which races with the login response and causes spurious 401 errors.
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          // API wraps responses in { success, message, data: { user, token, token_type } }
          dispatch(
            setCredentials({
              token: response.data.token,
              refreshToken: null,
              user: response.data.user,
            }),
          );
        } catch {
          // Error is handled by the component via the mutation result
        }
      },
    }),

    // ── Logout ───────────────────────────────────────────────────
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/logout",
        method: "POST",
      }),
      // NOTE: Do NOT use invalidatesTags here!
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Even if backend logout fails, we still clear local state
        } finally {
          dispatch(clearCredentials());
        }
      },
    }),

    // ── Get Current User ─────────────────────────────────────────
    getCurrentUser: builder.query<ApiResponse<User>, void>({
      query: () => "/api/me",
      providesTags: ["Auth"],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          // API wraps user in { success, message, data: User }
          dispatch(setUser(response.data));
        } catch (err: unknown) {
          // Only clear credentials on 401 (token truly invalid).
          // Server errors (500, 503, etc.) should NOT log the user out —
          // the token may still be valid; the backend is just having issues.
          const error = (err as { error?: { status?: number } })?.error;
          if (error?.status === 401) {
            dispatch(clearCredentials());
          }
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = authApi;
