// ── Clusters Feature Types ─────────────────────────────────────────
// Types for Regions and Markets management

import type { ApiResponse } from "./auth.types";

// ── Region ─────────────────────────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateRegionPayload {
  name: string;
  code: string;
}

// ── Market ─────────────────────────────────────────────────────────

export interface MarketRegion {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ClusterMarket {
  id: string;
  name: string;
  code: string;
  region_id: string;
  address: string;
  created_at: string;
  updated_at: string;
  region: MarketRegion;
}

export interface CreateMarketPayload {
  region_id: string;
  name: string;
  code: string;
  address: string;
}

// ── Typed API Response Wrappers ────────────────────────────────────

export type RegionsResponse = ApiResponse<Region[]>;
export type CreateRegionResponse = ApiResponse<Region>;
export type ClusterMarketsResponse = ApiResponse<ClusterMarket[]>;
export type CreateMarketResponse = ApiResponse<ClusterMarket>;
