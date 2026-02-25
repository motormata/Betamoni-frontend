import { baseApi } from "../baseApi";
import type {
  LoginCredentials,
  AuthResponse,
  User,
  RefreshTokenResponse,
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
      invalidatesTags: ["Auth"],
      // Persist credentials to Redux after successful login
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              token: data.token,
              refreshToken: data.refreshToken,
              user: data.user,
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
      invalidatesTags: ["Auth"],
      // Clear credentials regardless of API success/failure
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        // Optimistic: clear immediately so UI updates right away
        dispatch(clearCredentials());
        try {
          await queryFulfilled;
        } catch {
          // Even if backend logout fails, we still clear local state
        }
      },
    }),

    // ── Get Current User ─────────────────────────────────────────
    getCurrentUser: builder.query<User, void>({
      query: () => "/api/me",
      providesTags: ["Auth"],
      // Update user in Redux when fetched
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          // If fetching user fails (e.g., invalid token), clear auth
          dispatch(clearCredentials());
        }
      },
    }),

    // ── Refresh Token ────────────────────────────────────────────
    refreshToken: builder.mutation<
      RefreshTokenResponse,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/api/refresh",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useRefreshTokenMutation,
} = authApi;
