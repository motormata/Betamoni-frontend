import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import type { RootState } from "@/store";
import { clearCredentials, updateToken } from "@/store/slices/authSlice";

// Create a new mutex to prevent multiple token refresh requests from firing concurrently
const mutex = new Mutex();

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

// ── Endpoints that should NOT trigger automatic re-auth ────────────
// These are auth-lifecycle endpoints — retrying them would cause loops.
const SKIP_REAUTH_URLS = ["/api/login", "/api/logout", "/api/refresh"];

// ── Base query with 401 handling ───────────────────────────────────

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  
  // 1. Try the original request
  let result = await rawBaseQuery(args, api, extraOptions);

  // 2. If we got a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const requestUrl = typeof args === "string" ? args : args.url;

    // Skip auto-refresh for endpoints that shouldn't loop
    if (!SKIP_REAUTH_URLS.some((url) => requestUrl.includes(url))) {
      // Check if we are not already refreshing
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          // Attempt to get a new token.
          // The backend uses the existing (expired) token in the authorization header
          // to issue the new one.
          const refreshResult = await rawBaseQuery(
            { url: "/api/refresh", method: "POST" },
            api,
            extraOptions,
          );

          if (refreshResult.data) {
            // The format from the backend is an ApiResponse wrapper.
            // Explicitly cast to unknown and then to the type we expect
            const responseData = refreshResult.data as {
              success: boolean;
              data?: { token: string };
            };

            if (responseData.success && responseData.data?.token) {
              const newToken = responseData.data.token;
              
              // Store the new token in Redux and localStorage
              api.dispatch(updateToken(newToken));
              
              // Retry the initial failing request
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              // Refresh endpoint returned 200 but format was unexpected
              api.dispatch(clearCredentials());
            }
          } else {
            // Token refresh failed (e.g. 401 or 500 from the refresh endpoint itself)
            api.dispatch(clearCredentials());
          }
        } finally {
          // Release the mutex lock so queued queries can run
          release();
        }
      } else {
        // Wait until the refresh in progress finishes
        await mutex.waitForUnlock();
        // Retry the initial failing query now that the token has been refreshed
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else if (requestUrl.includes("/api/me")) {
      // Edge case: If /api/me fails with 401 during app startup load,
      // we clear credentials (handled cleanly in authApi.ts already,
      // but safe to do here if it slips through)
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

// ── Base API definition ────────────────────────────────────────────

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Loans", "Transactions", "Regions", "Markets", "Borrowers", "AgentLoans", "SupervisorLoans", "Payments", "LoanProducts"],
  endpoints: () => ({}),
});
