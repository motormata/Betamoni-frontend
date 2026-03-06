import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import { clearCredentials } from "@/store/slices/authSlice";

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
const SKIP_REAUTH_URLS = ["/api/login", "/api/logout", "/api/me"];

// ── Base query with 401 handling ───────────────────────────────────

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 1. Try the original request
  const result = await rawBaseQuery(args, api, extraOptions);

  // 2. If we got a 401, check if we should auto-logout
  if (result.error && result.error.status === 401) {
    // Extract the URL from the request args
    const requestUrl = typeof args === "string" ? args : args.url;

    // Skip auto-logout for auth-lifecycle endpoints
    // These endpoints handle their own error cases
    if (!SKIP_REAUTH_URLS.some((url) => requestUrl.includes(url))) {
      // For non-auth endpoints, a 401 means the token is invalid — force logout
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
