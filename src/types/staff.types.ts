// ── Staff / User Management Types ──────────────────────────────────

import type { ApiResponse } from "./auth.types";
import type { UUID } from "./common.types";

// ── Role ───────────────────────────────────────────────────────────
// GET /api/admin/roles

export interface Role {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type RolesResponse = ApiResponse<Role[]>;

// ── Staff User ─────────────────────────────────────────────────────

export type StaffRole = "super-admin" | "supervisor" | "agent";

export interface StaffUser {
  id: UUID;
  name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  kyc_status: string;
  email_verified_at: string | null;
  is_active: 1 | 0;
  market_id: UUID | null;
  role_id: UUID;
  created_at: string;
  updated_at: string;
  role: {
    id: UUID;
    name: string;
    slug: string; // "super-admin" | "supervisor" | "agent"
    description: string;
    created_at: string;
    updated_at: string;
  };
  market: {
    id: UUID;
    name: string;
    code: string;
  } | null;
}

export type UsersResponse = ApiResponse<StaffUser[]>;

// ── Create User ────────────────────────────────────────────────────
// POST /api/admin/users

export interface CreateUserPayload {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role_id: UUID;   // from GET /api/admin/roles
  market_id: UUID; // from GET /api/markets
}

export interface CreatedUser {
  id: UUID;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  market: string | null;
}

export type CreateUserResponse = ApiResponse<CreatedUser>;

// ── Assign Market ──────────────────────────────────────────────────
// POST /api/admin/users/{id}/assign-market

export interface AssignMarketPayload {
  userId: UUID;    // goes in the URL path
  market_id: UUID; // goes in the body
}

export type AssignMarketResponse = ApiResponse<{ message: string }>;
