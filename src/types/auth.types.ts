// ── User & Role Types ──────────────────────────────────────────────
import type { UUID } from "./common.types";

// Backend uses hyphenated role names
export type UserRole = "super-admin" | "supervisor" | "agent";

export interface User {
  id: UUID;
  email: string;
  name: string;
  phone: string | null;
  agent_code: string | null;
  is_active: number;
  role: UserRole;
  role_name: string;
  market: string | null;
}

// ── API Response Wrapper ───────────────────────────────────────────
// All API responses are wrapped in this envelope
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

// ── Auth Request/Response Types ────────────────────────────────────

export interface LoginCredentials {
  login: string;
  password: string;
}

// The actual data nested inside ApiResponse for login
export interface LoginResponseData {
  user: User;
  token: string;
  token_type: string;
}

// Full login API response (what RTK Query sees after fetchBaseQuery parses JSON)
export type AuthResponse = ApiResponse<LoginResponseData>;

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// ── Redux Auth State ───────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
