import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import { clearCredentials, setCredentials } from "@/store/slices/authSlice";

// ── Raw base query ─────────────────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,

  prepareHeaders: (headers, { getState }) => {
    // Read token from Redux state (authoritative source)
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// ── Base query with automatic re-auth on 401 ──────────────────────

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 1. Try the original request
  let result = await rawBaseQuery(args, api, extraOptions);

  // 2. If we got a 401, attempt token refresh
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      // Attempt to refresh the token
      const refreshResult = await rawBaseQuery(
        {
          url: "/api/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        // Refresh succeeded — store new tokens and retry original request
        const data = refreshResult.data as {
          token: string;
          refreshToken: string;
          user: RootState["auth"]["user"];
        };

        api.dispatch(
          setCredentials({
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user ?? state.auth.user!,
          }),
        );

        // Retry the original request with the new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed — force logout
        api.dispatch(clearCredentials());
      }
    } else {
      // No refresh token available — force logout
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

// ── Base API definition ────────────────────────────────────────────

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Loans", "Transactions"],
  endpoints: () => ({}),
});
