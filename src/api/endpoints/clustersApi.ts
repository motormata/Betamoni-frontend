import { baseApi } from "../baseApi";
import type {
  RegionsResponse,
  CreateRegionPayload,
  CreateRegionResponse,
  ClusterMarketsResponse,
  CreateMarketPayload,
  CreateMarketResponse,
} from "@/types/clusters.types";

// ── Clusters API Endpoints ─────────────────────────────────────────

export const clustersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Regions ──────────────────────────────────────────────────

    /** GET /api/regions — list all regions */
    getRegions: builder.query<RegionsResponse, void>({
      query: () => "/api/regions",
      providesTags: ["Regions"],
    }),

    /** POST /api/admin/regions — create a new region (super-admin only) */
    createRegion: builder.mutation<CreateRegionResponse, CreateRegionPayload>({
      query: (body) => ({
        url: "/api/admin/regions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Regions"],
    }),

    // ── Markets ───────────────────────────────────────────────────

    /** GET /api/markets — list all markets */
    getClusterMarkets: builder.query<ClusterMarketsResponse, void>({
      query: () => "/api/markets",
      providesTags: ["Markets"],
    }),

    /** POST /api/admin/markets — create a new market (super-admin only) */
    createMarket: builder.mutation<CreateMarketResponse, CreateMarketPayload>({
      query: (body) => ({
        url: "/api/admin/markets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Markets"],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useCreateRegionMutation,
  useGetClusterMarketsQuery,
  useCreateMarketMutation,
} = clustersApi;
