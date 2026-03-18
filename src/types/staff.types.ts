// ── Staff / User Management Types ──────────────────────────────────

import type { ApiResponse } from "./auth.types";

// ── Role ───────────────────────────────────────────────────────────
// GET /api/admin/roles

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type RolesResponse = ApiResponse<Role[]>;

// ── Staff User ─────────────────────────────────────────────────────
// Shape used for the user list (mock until a list endpoint exists)

export type StaffRole = "super-admin" | "supervisor" | "agent";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  role_name: string;
  market: string | null;   // market name for display
  market_id: number | null;
  agent_code: string | null;
  is_active: 1 | 0;
}

// ── Create User ────────────────────────────────────────────────────
// POST /api/admin/users

export interface CreateUserPayload {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role_id: string;   // UUID from roles endpoint
  market_id: string; // UUID from markets endpoint
}

export interface CreatedUser {
  id: string;
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
  userId: string;  // goes in the URL path
  market_id: number; // goes in the body
}

export type AssignMarketResponse = ApiResponse<{ message: string }>;
